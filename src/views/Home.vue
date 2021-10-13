<template>
  <div>
    <div v-if="isElectron">
      <top-bar></top-bar>
    </div>
    <div>
      <chat-window
          :height="pageHeight"
          :styles="styles"
          :current-user-id="currentUserId"
          :room-id="roomId"
          :rooms="loadedRooms"
          :loading-rooms="loadingRooms"
          :messages="messages"
          :messagesLoaded="messageLoaded"
          :rooms-loaded="roomsLoaded"
          @send-message="sendMessage"
      />
    </div>
  </div>
</template>

<script>
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'
import {ref} from "@vue/composition-api";
import TopBar from "../components/TopBar";
import msg from "@/plugins/msg";
import localStoreUtil from "@/utils/localStoreUtil";
import {clearUnReadMessage, getHistoryMessage, getUserInfo, sendChatMessage} from "@/net/messageSend";


export default {
  name: 'HelloWorld',
  components: {
    TopBar,
    ChatWindow
  },
  setup() {
    // 当前用户ID
    const currentUserId = ref('')
    // 已加载的房间列表
    const loadedRooms = ref([])
    // 当前房间ID
    const roomId = ref('')
    // 当前消息列表
    const messages = ref([])
    // 消息是否加载完成
    const messageLoaded = ref(false)
    const loadingRooms = ref(true)
    const roomsLoaded = ref(true)

    let isElectron = ref(process.env.IS_ELECTRON);

    const init = () => {
      currentUserId.value = localStoreUtil.getValue('username')
      getUserInfo(currentUserId.value)

      // 获取用户信息响应
      msg.$on("COMMAND_GET_USER_RESP", (data) => {
        loadedRooms.value = data.data.groups
        loadingRooms.value = false

        // 获取历史消息
        if (loadedRooms.value.length > 0) {
          roomId.value = loadedRooms.value[0].roomId

          getHistoryMessage(roomId.value)

          messageLoaded.value = false
        }

      })

      // 获取历史消息响应
      msg.$on("COMMAND_GET_MESSAGE_RESP", (data) => {
        messages.value = data.data
        messageLoaded.value = true
      })

      // 聊天请求
      msg.$on("COMMAND_CHAT_RESP", (data) => {
        const message = data.data

        if(message.roomId === roomId.value) {
          clearUnReadMessage(roomId.value)
          messages.value.push(message)
          return
        }

        loadedRooms.value.forEach(room => {
          if(room.roomId === message.roomId){
            room.unreadCount = message.unreadCount
          }
        })

      })
    }

    init()

    const sendMessage = ({ content, roomId, files, replyMessage }) => {
      console.log(files,replyMessage)
      const message = {
        senderId: currentUserId.value,
        content,
        roomId,
      }
      sendChatMessage(message)
    }

    const styles = ref({
      container: {
        boxShadow: ''
      }
    })

    const pageHeight = isElectron ? 'calc(100vh - 48px)' : '100vh'

    return {
      currentUserId,
      loadedRooms,
      roomId,
      loadingRooms,
      messages,
      isElectron,
      pageHeight,
      messageLoaded,
      roomsLoaded,
      styles,
      sendMessage
    }
  },
}
</script>
<style scoped>
.chat-window {
  height: calc(100vh - 64px);
}
</style>
