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
          :message-actions="messageActions"
          @send-message="sendMessage"
          @add-room="addRoom"
          @fetch-messages="fetchMessage"
          @send-message-reaction="sendMessageReaction"
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
              {{ curUser.username }}
            </h3>
            <v-spacer></v-spacer>
            <v-menu bottom left offset-y>
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
              <v-card>
                <v-list-item-content class="justify-center">
                  <div class="mx-auto text-center pl-3 pr-3">
                    <v-btn
                        depressed
                        rounded
                        text
                        @click="addRoom"
                    >
                      创建群组
                    </v-btn>
                    <v-divider class="my-3"></v-divider>
                    <v-btn
                        depressed
                        rounded
                        text
                        @click="addChat"
                    >
                      添加会话
                    </v-btn>
                    <v-divider class="my-3"></v-divider>
                    <v-btn
                        depressed
                        rounded
                        text
                        @click="quit"
                    >
                      退出
                    </v-btn>
                  </div>
                </v-list-item-content>
              </v-card>
            </v-menu>
          </div>
        </template>
      </chat-window>
      <v-navigation-drawer
          v-model="chatAddVisible"
          absolute
          temporary
          hide-overlay
          width="300"
      >
        <add-chat @close="chatAddVisible = !chatAddVisible" :users="systemUsers" @chat="createChat"></add-chat>
      </v-navigation-drawer>
    </div>
  </div>
</template>

<script>
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'
import {nextTick, ref} from "@vue/composition-api";
import TopBar from "../components/TopBar";
import msg from "@/plugins/msg";
import localStoreUtil from "@/utils/localStoreUtil";
import {
  buildLastMessage,
  clearUnReadMessage, createGroup,
  getHistoryMessage,
  getUserInfo,
  getUserList, messageReaction, quitSystem,
  sendChatMessage
} from "@/net/message";
import {mdiChevronDown, mdiWindowClose} from "@mdi/js";
import AddChat from "@/components/AddChat";


export default {
  name: 'HelloWorld',
  components: {
    AddChat,
    TopBar,
    ChatWindow
  },
  setup() {
    // 当前用户ID
    const currentUserId = ref('')
    // 当前用户信息
    const curUser = ref({})
    // 已加载的房间列表
    const loadedRooms = ref([])
    // 当前房间ID
    const roomId = ref('')
    // 当前消息列表
    const messages = ref([])
    // 消息是否加载完成
    const messageLoaded = ref(false)
    // 加载动画
    const loadingRooms = ref(false)
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
    const messageActions = ref([
      {
        name: 'replyMessage',
        title: '回复'
      },
      {
        name: 'editMessage',
        title: '编辑',
        onlyMe: true
      },
      {
        name: 'deleteMessage',
        title: '删除',
        onlyMe: true
      }
    ])
    const systemUsers = ref([])

    let isElectron = ref(process.env.IS_ELECTRON);
    const chatAddVisible = ref(false)

    const init = () => {
      currentUserId.value = localStoreUtil.getValue('userId')
      getUserInfo(currentUserId.value)

      // 获取用户信息响应
      msg.$on("COMMAND_GET_USER_RESP", (data) => {
        curUser.value = data.data
        loadedRooms.value = data.data.groups
        nextTick(() => {
          loadingRooms.value = false
          roomsLoaded.value = true
        })
        // 获取历史消息
        if (loadedRooms.value.length > 0) {
          changeRoom(loadedRooms.value[0].roomId)
        }

      })

      // 获取历史消息响应
      msg.$on("COMMAND_GET_MESSAGE_RESP", (data) => {
        messages.value = [...data.data]

        setTimeout(() => {
          messageLoaded.value = true
        })
      })

      // 聊天请求
      msg.$on("COMMAND_CHAT_RESP", (data) => {
        const message = data.data

        const roomIndex = loadedRooms.value.findIndex(
            r => message.roomId === r.roomId
        )

        if (!message.isSystem) {
          const lastMessage = buildLastMessage(message)
          console.log('find LastMessage ', lastMessage)

          if (!loadedRooms.value[roomIndex].lastMessage) {

            const room = {
              ...loadedRooms.value[roomIndex],
              lastMessage
            }

            loadedRooms.value[roomIndex] = room
          } else {
            loadedRooms.value[roomIndex].lastMessage = lastMessage
          }

          loadedRooms.value = [...loadedRooms.value]
        }

        if (message.roomId === roomId.value) {
          clearUnReadMessage(roomId.value)
          messages.value.push(message)
          return
        }
        // 将目标消息置顶
        upRoom(message.roomId)
        loadedRooms.value[roomIndex].unreadCount = message.unreadCount
        loadedRooms.value = [...loadedRooms.value]

      })

      // 用户状态变化消息
      msg.$on("COMMAND_USER_STATUS_RESP", (data) => {
        const {group} = data.data
        loadedRooms.value.forEach(room => {
          if (room.roomId === group.roomId) {
            room.users = [...group.users]
          }
        })

      })

      // 用户列表
      msg.$on("COMMAND_USER_LIST_RESP", (data) => {
        systemUsers.value = data.data
      })

      // 群组创建成功
      msg.$on("COMMAND_CREATE_GROUP_RESP", (data) => {
        console.log("群组创建成功", data)
        let room = data.data
        loadedRooms.value[loadedRooms.value.length] = room
        loadedRooms.value = [...loadedRooms.value]

        setTimeout(() => {
          loadingRooms.value = false
          roomsLoaded.value = true
        })
        changeRoom(room.roomId)
      })

      // 加入群组返回
      msg.$on("COMMAND_JOIN_GROUP_NOTIFY_RESP", (data) => {
        let room = data.data.group
        console.log("加入群组返回", room)

        loadedRooms.value[loadedRooms.value.length] = room
        loadedRooms.value = [...loadedRooms.value]

        setTimeout(() => {
          loadingRooms.value = false
          roomsLoaded.value = true
        })
        if (loadedRooms.value.length === 1) {
          changeRoom(room.roomId)
        }
      })
    }

    init()

    const sendMessage = ({content, roomId, files, replyMessage}) => {
      console.log(files, replyMessage)
      let reply;
      if (replyMessage) {
        reply = {
          content: replyMessage.content,
          senderId: replyMessage.senderId,
        }
      }

      const message = {
        senderId: currentUserId.value,
        content,
        roomId,
        replyMessage: reply
      }
      sendChatMessage(message)
      upRoom(roomId)
    }

    const addRoom = () => {
      console.log('addroom')
    }

    const changeRoom = item => {
      roomId.value = item
      console.log(loadedRooms.value)
      console.log(item, 'roomId')

      const roomIndex = loadedRooms.value.findIndex(r => item === r.roomId)
      console.log(roomIndex, 'roomIndex')
      loadedRooms.value[roomIndex].unreadCount = 0;
      loadedRooms.value = [...loadedRooms.value]

      messages.value = []
      messageLoaded.value = false
      getHistoryMessage(roomId.value)
      clearUnReadMessage(roomId.value)
    }

    const addChat = () => {
      chatAddVisible.value = !chatAddVisible.value
      getUserList()
    }

    const createChat = item => {
      chatAddVisible.value = !chatAddVisible.value
      console.log(item, '创建会话')
      const roomIndex = loadedRooms.value.findIndex(r => item._id === r.friendId)
      if (roomIndex === -1) {
        createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
        return
      }

      upRoom(loadedRooms.value[roomIndex].roomId)
      changeRoom(loadedRooms.value[roomIndex].roomId)
    }

    const fetchMessage = (item) => {
      if (item.room.roomId === roomId.value) {
        return
      }
      console.log(item, 'fetchMessage')
      changeRoom(item.room.roomId)
    }

    /**
     * 会话置顶
     * @param roomId 会话Id
     */
    const upRoom = (roomId) => {
      const roomIndex = loadedRooms.value.findIndex(r => roomId === r.roomId)
      if (roomIndex === -1) {
        return
      }
      loadedRooms.value[roomIndex].index = new Date().getTime()
      loadedRooms.value = [...loadedRooms.value]
    }

    const fetchRoom = (item) => {
      console.log(item, 'fetchRoom')
    }

    const sendMessageReaction = ({ reaction, remove, messageId, roomId }) => {
      console.log( reaction, remove, messageId, roomId)
      messageReaction({ reaction, remove, messageId, roomId })
    }

    const quit = () => {
      quitSystem()
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
      chatAddVisible,
      curUser,
      systemUsers,
      messageActions,
      createChat,
      sendMessage,
      addRoom,
      addChat,
      sendMessageReaction,
      fetchMessage,
      fetchRoom,
      quit,

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
