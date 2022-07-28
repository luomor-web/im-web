<template>
  <div>
    <div class="emoticon-content">
      <!--    <v-text-field hide-details rounded dense filled placeholder="搜索" />-->
      <div class="emoticon-img emoticon-add" @click="addEmoticon">
        <div class="d-flex">
          <v-icon :size="48">
            mdi-plus
          </v-icon>
        </div>
      </div>
      <div v-for="(item, index) of userEmoticons" :key="index"
           class="emoticon-img"
           @mouseover="operationHover = index"
           @mouseleave="closeOptions"
      >
        <v-slide-x-reverse-transition>
          <div v-show="operationHover === index" class="emoticon-operation">
            <div class="vac-svg-button emoticon-operation-button" @click="optionsOpened = index">
              <v-icon :size="20">
                mdi-chevron-down-circle
              </v-icon>
            </div>
          </div>
        </v-slide-x-reverse-transition>
        <v-slide-x-reverse-transition>
          <div v-show="optionsOpened === index" class="emoticon-menu-list" @click="deleteEmoticon(item)">
            <div class="emoticon-menu-item">
              删除
            </div>
          </div>
        </v-slide-x-reverse-transition>
        <v-img :src="item.url" max-height="75px" @click="sendEmoticon(item)" />
      </div>
    </div>
    <im-upload ref="upload" @sure="sure" />
    <div v-if="!emoticonLoaded" v-intersect="onIntersect" style="height: 40px" class="text-center">
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>
  </div>
</template>
<script>
import { computed, inject, onMounted, onUnmounted, ref } from '@vue/composition-api'
import store from '@/store'
import { uuid } from '@/utils/id-util'
import moment from 'moment/moment'
import { operationEmoticon, searchUserEmoticon, sendChatMessage } from '@/net/send-message'
import ImUpload from '@/components/basic/ImUpload'
import msg from '@/plugins/msg'

export default {
  name: 'EmoticonUser',
  components: { ImUpload },
  setup () {
    const userEmoticons = computed(() => store.state.userEmoticons)
    const emoticonLoaded = computed(() => store.state.userEmoticonLoaded)
    const curUser = computed(() => store.state.curUser)
    const currentUserId = computed(() => store.state.currentUserId)
    const roomId = computed(() => store.state.roomId)
    const upload = ref(null)
    const imComponent = inject('imComponent', () => {})
    const operationHover = ref(-1)
    const optionsOpened = ref(-1)

    onMounted(() => {
      msg.$on('INSERT_TO_USER_MSG', (data) => {
        if (data.success) {
          imComponent.value.tip({ display: true, text: '新增成功', timeout: 1000 })
        }
      })
      msg.$on('DELETE_MSG', (data) => {
        if (data.success) {
          imComponent.value.tip({ display: true, text: '删除成功', timeout: 1000 })
          closeOptions()
        }
      })
    })

    onUnmounted(() => {
      msg.$off('INSERT_TO_USER_MSG')
      msg.$off('DELETE_MSG')
    })

    const onIntersect = (entries) => {
      if (entries[0].isIntersecting) {
        loadMoreEmoticons()
      }
    }

    const closeOptions = () => {
      operationHover.value = -1
      optionsOpened.value = -1
    }

    const addEmoticon = () => {
      upload.value.startUpload(true)
    }

    const loadMoreEmoticons = () => {
      const id = userEmoticons.value.length > 0 ? userEmoticons.value[userEmoticons.value.length - 1]._id : ''
      searchUserEmoticon({ id })
    }

    const sure = (file) => {
      const data = {
        url: file.url,
        size: file.size,
        type: 'INSERT_TO_USER'
      }
      operationEmoticon(data)
    }

    const deleteEmoticon = (item) => {
      const data = {
        emoticonId: item._id,
        type: 'DELETE'
      }
      operationEmoticon(data)
    }

    const sendEmoticon = (item) => {
      const files = [{
        isEmoticon: true,
        url: item.url,
        name: item.name,
        size: item.size,
        _id: item._id,
        type: item.type
      }]
      const message = {
        senderId: currentUserId.value, content: '', roomId: roomId.value, files
      }

      // 如果存在文件, 则把文件加入到上传列表,等待上传完毕后发送
      // 构建消息, 添加到消息列表中
      message._id = uuid()
      message.system = false
      message.date = moment().format('YYYY-MM-DD')
      message.username = curUser.value.username
      message.avatar = curUser.value.avatar
      message.timestamp = '...'

      store.commit('upRoom', roomId)

      store.commit('pushMessage', message)

      store.commit('addWaitSendMessage', { message })
      sendChatMessage(message)
    }

    return {
      userEmoticons,
      emoticonLoaded,
      upload,
      operationHover,
      optionsOpened,

      sure,
      addEmoticon,
      closeOptions,
      onIntersect,
      sendEmoticon,
      deleteEmoticon
    }
  }
}
</script>

<style scoped lang="scss">
.emoticon-content {
  padding: 8px;
  display: flex;
  flex-wrap: wrap;

  .emoticon-add {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #757575;
    cursor: pointer;
  }

  .emoticon-img {
    margin: 3px;
    height: 75px;
    max-height: 75px;
    width: 75px;
    display: flex;
    transition: all 0.2s;
    position: relative;

    .emoticon-operation {
      height: 24px;
      width: 24px;
      background-color: #d0d7d7;
      position: absolute;
      z-index: 1;
      right: 0;
      border-bottom-left-radius: 8px;

      .emoticon-operation-button {
        position: absolute;
        z-index: 2;
        right: 2px;
        top: 2px;
      }
    }

    .emoticon-menu-list {
      z-index: 3;
      width: 50px;
      height: 24px;
      position: absolute;
      top: 24px;
      right: 0;
      font-size: 16px;
      text-align: center;

      border-radius: 4px;
      display: block;
      cursor: pointer;
      background: var(--chat-dropdown-bg-color);

      :hover {
        background: var(--chat-dropdown-bg-color-hover);
        transition: background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      }

      :not(:hover) {
        transition: background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      }

      .emoticon-menu-item {
        width: 50px;
      }
    }

    &:hover {
      transform: scale(1.1);
      opacity: 1;
    }
  }
}
</style>
