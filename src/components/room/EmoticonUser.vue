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
            <div class="vac-svg-button emoticon-operation-top">
              <v-tooltip bottom :z-index="11">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon :size="20"
                          v-bind="attrs"
                          @click="moveTopEmoticon(item)"
                          v-on="on"
                  >
                    mdi-arrow-up-circle
                  </v-icon>
                </template>
                <span>移到最前</span>
              </v-tooltip>
            </div>
            <div class="vac-svg-button emoticon-operation-store">
              <v-tooltip bottom :z-index="11">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon :size="20"
                          v-bind="attrs"
                          @click="shareEmoticon(item)"
                          v-on="on"
                  >
                    mdi-cloud-circle
                  </v-icon>
                </template>
                <span>分享</span>
              </v-tooltip>
            </div>
            <div class="vac-svg-button emoticon-operation-delete">
              <v-tooltip bottom :z-index="11">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon :size="20"
                          v-bind="attrs"
                          @click="deleteEmoticon(item)"
                          v-on="on"
                  >
                    mdi-delete-circle
                  </v-icon>
                </template>
                <span>删除</span>
              </v-tooltip>
            </div>
          </div>
        </v-slide-x-reverse-transition>
        <v-img :src="item.url" max-height="75px" :lazy-src="item.url" @click="sendEmoticon(item)">
          <template #placeholder>
            <v-row
              class="fill-height ma-0"
              align="center"
              justify="center"
            >
              <v-progress-circular
                indeterminate
                color="grey"
              />
            </v-row>
          </template>
        </v-img>
      </div>
    </div>
    <im-upload ref="upload" @sure="sure" />
    <div v-if="!emoticonLoaded" v-intersect="onIntersect" style="height: 40px" class="text-center">
      <v-progress-circular
        indeterminate
        color="grey lighten-5"
      />
    </div>
  </div>
</template>
<script>
import { computed, onMounted, onUnmounted, ref } from '@vue/composition-api'
import store from '@/store'
import { uuid } from '@/utils/id-util'
import moment from 'moment/moment'
import { operationEmoticon, searchUserEmoticon, sendChatMessage } from '@/net/send-message'
import ImUpload from '@/components/basic/ImUpload'
import msg from '@/plugins/msg'
import tip from '@/plugins/tip'

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
    const operationHover = ref(-1)

    onMounted(() => {
      msg.$on('EMOTICON_INSERT_TO_USER_MSG', (data) => {
        if (data.success) {
          tip.info('新增成功', 1000)
        }
      })
      msg.$on('EMOTICON_DELETE_MSG', (data) => {
        if (data.success) {
          tip.info('删除成功', 1000)
          closeOptions()
        }
      })
      msg.$on('EMOTICON_MOVE_TOP', (data) => {
        if (data.success) {
          tip.info('移动成功', 1000)
          closeOptions()
        }
      })
      msg.$on('EMOTICON_INSERT_TO_STORE', (data) => {
        if (data.success) {
          tip.info('分享成功', 1000)
          closeOptions()
        }
      })
    })

    onUnmounted(() => {
      msg.$off('EMOTICON_INSERT_TO_USER_MSG')
      msg.$off('EMOTICON_DELETE_MSG')
      msg.$off('EMOTICON_MOVE_TOP')
      msg.$off('EMOTICON_INSERT_TO_STORE')
    })

    const onIntersect = (entries) => {
      if (entries[0].isIntersecting) {
        loadMoreEmoticons()
      }
    }

    const closeOptions = () => {
      operationHover.value = -1
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
    const shareEmoticon = (item) => {
      const data = {
        emoticonId: item._id,
        type: 'INSERT_TO_STORE'
      }
      operationEmoticon(data)
    }
    const moveTopEmoticon = (item) => {
      const data = {
        emoticonId: item._id,
        type: 'MOVE_TOP'
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

      sure,
      addEmoticon,
      closeOptions,
      onIntersect,
      sendEmoticon,
      deleteEmoticon,
      shareEmoticon,
      moveTopEmoticon
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
      width: 66px;
      background-color: #d0d7d7;
      position: absolute;
      z-index: 1;
      right: 0;
      border-bottom-left-radius: 8px;

      .emoticon-operation-delete {
        position: absolute;
        z-index: 2;
        right: 2px;
        top: 2px;
      }

      .emoticon-operation-store {
        position: absolute;
        z-index: 2;
        right: 22px;
        top: 2px;
      }

      .emoticon-operation-top {
        position: absolute;
        z-index: 2;
        right: 42px;
        top: 2px;
      }
    }

    &:hover {
      transform: scale(1.1);
      opacity: 1;
    }
  }
}
</style>
