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
          :show-add-room="false"
          :room-id="roomId"
          :rooms="loadedRooms"
          :loading-rooms="loadingRooms"
          :messages="messages"
          :messagesLoaded="messageLoaded"
          :rooms-loaded="roomsLoaded"
          :text-messages="textMessages"
          @send-message="sendMessage"
          @add-room="addRoom"
      >
        <template #rooms-header="{}">
          <div class="room-header-container">
            <v-avatar>
              <img
                  src="https://cdn.vuetifyjs.com/images/john.jpg"
                  alt="John"
              >
            </v-avatar>
            <h3 class="ml-3">
              <!--              {{currentUserId}}-->
              {{ '诸葛亮' }}
            </h3>
            <v-spacer></v-spacer>
            <v-menu offset-x>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on"
                >
                  <v-icon>
                    {{ icons.mdiChevronDown }}
                  </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-list-item-title>{{ "创建群组" }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

          </div>
        </template>
      </chat-window>
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
import {buildLastMessage, clearUnReadMessage, getHistoryMessage, getUserInfo, sendChatMessage} from "@/net/message";
import {mdiChevronDown, mdiWindowClose} from "@mdi/js";


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
    const textMessages = ref({
      ROOMS_EMPTY: '去创建一些聊天吧',
      ROOM_EMPTY: '暂无会话被选择',
      NEW_MESSAGES: 'New Messages',
      MESSAGE_DELETED: '消息已删除',
      MESSAGES_EMPTY: '暂无消息',
      CONVERSATION_STARTED: '会话开始于',
      TYPE_MESSAGE: '输入消息',
      SEARCH: '搜索',
      IS_ONLINE: '当前在线',
      LAST_SEEN: '最后上线时间 ',
      IS_TYPING: 'is writing...'
    })

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

        if (!message.isSystem) {
          const lastMessage = buildLastMessage(message)
          loadedRooms.value.forEach(room => {
            if (room.roomId === message.roomId) {
              room.lastMessage = lastMessage
            }
          })
        }


        if (message.roomId === roomId.value) {
          clearUnReadMessage(roomId.value)
          messages.value.push(message)
          return
        }

        loadedRooms.value.forEach(room => {
          if (room.roomId === message.roomId) {
            room.unreadCount = message.unreadCount
          }
        })

      })

      /**
       * 用户状态变化消息
       */
      msg.$on("COMMAND_USER_STATUS_RESP", (data) => {
        const {group} = data.data
        loadedRooms.value.forEach(room => {
          if (room.roomId === group.roomId) {
            room.users = [...group.users]
          }
        })

      })
    }

    init()

    const sendMessage = ({content, roomId, files, replyMessage}) => {
      console.log(files, replyMessage)
      const message = {
        senderId: currentUserId.value,
        content,
        roomId,
      }
      sendChatMessage(message)
    }

    const addRoom = () => {
      console.log('addroom')
      const ipcRenderer = window.require('electron').ipcRenderer

      ipcRenderer.send('create-window', 'https://github.com')

    }

    const styles = ref({
      container: {
        boxShadow: ''
      }
    })

    const pageHeight = isElectron ? 'calc(100vh - 32px)' : '100vh'

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
      textMessages,
      sendMessage,
      addRoom,

      icons: {
        mdiWindowClose,
        mdiChevronDown
      }
    }
  },
}
</script>
<style scoped>
.room-header-container {
  position: sticky;
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 15px;
}
</style>
