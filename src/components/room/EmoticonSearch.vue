<template>
  <div class="emoticon-search">
    <input class="emoticon-search-input" placeholder="搜索" />
    <div class="emoticon-search-content">
      <!--    <v-text-field hide-details rounded dense filled placeholder="搜索" />-->

      <div v-for="(item, index) of emoticons" :key="index" class="emoticon-search-img" @click="sendEmoticon(item)">
        <v-img :src="item.url" max-height="75px" />
      </div>
      <div v-if="!emoticonLoaded" v-intersect="onIntersect" style="height: 40px" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from '@vue/composition-api'
import { searchEmoticon, sendChatMessage } from '@/net/send-message'
import store from '@/store'
import { uuid } from '@/utils/id-util'
import moment from 'moment/moment'
import msg from '@/plugins/msg'

export default {
  name: 'EmoticonSearch',
  setup() {
    const emoticons = computed(() => store.state.emoticons)
    const curUser = computed(() => store.state.curUser)
    const currentUserId = computed(() => store.state.currentUserId)
    const roomId = computed(() => store.state.roomId)
    const emoticonLoaded = ref(false)
    const searchName = ref('')

    onMounted(() => {
      emoticonsLoad()
      msg.$on('COMMAND_EMOTICON_SEARCH_RESP', onSearchResp)
    })

    onUnmounted(() => {
      store.commit('clearEmoticons')
      msg.$off('COMMAND_EMOTICON_SEARCH_RESP')
    })

    const onSearchResp = (data) => {
      store.commit('pushEmoticons', data.data)
      emoticonLoaded.value = data.data < 20
    }

    const emoticonsLoad = (name) => {
      const id = emoticons.value.length > 0 ? emoticons.value[emoticons.value.length - 1]._id : ''
      searchEmoticon({ content: name, id })
    }

    const onIntersect = (entries) => {
      if (entries[0].isIntersecting) {
        emoticonsLoad(searchName.value)
      }
    }

    const sendEmoticon = (item) => {
      console.log(item)

      const files = [{
        isEmoticon: true,
        url: item.url,
        name: item.name,
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
      console.log(message, 'message')
      sendChatMessage(message)
    }

    return {
      emoticons,
      emoticonLoaded,
      onIntersect,
      sendEmoticon
    }
  }
}
</script>

<style scoped lang="scss">

.emoticon-search{
  padding: 8px;

  .emoticon-search-input {
    font-size: 16px;
    display: block;
    width: 100%;
    padding: .2em .6em;
    border-radius: 25px;
    border: 1px solid #d9d9d9;
    outline: 0;
    margin-bottom: 8px;
  }

  .emoticon-search-content {
    display: flex;
    flex-wrap: wrap;

    .emoticon-search-img {
      margin: 3px;
      //background-color: #b7c1ca;
      max-height: 75px;
      width: 75px;
      display: flex;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.1);
        opacity: 0.7;
      }
    }
  }
}

</style>
