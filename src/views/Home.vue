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
            <v-btn
                icon
                x-large
                @click="editUserProfile"
            >
              <v-avatar color="#b7c1ca">
                <img
                    :src="curUser.avatar"
                    :alt="curUser.username"
                >
              </v-avatar>
            </v-btn>
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
      <add-chat @close="chatAddVisible = false" :users="systemUsers" @chat="createChat"
                :visible="chatAddVisible"></add-chat>
      <add-room @close="roomAddVisible = false" :users="systemUsers" :visible="roomAddVisible"></add-room>
      <user-profile @close="userProfileVisible = false" :user="curUser" :visible="userProfileVisible"></user-profile>
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
  clearUnReadMessage,
  createGroup,
  getHistoryMessage,
  getUserInfo,
  getUserList,
  messageReaction,
  quitSystem,
  sendChatMessage
} from "@/net/message";
import {mdiAccount, mdiChevronDown, mdiWindowClose} from "@mdi/js";
import AddChat from "@/components/AddChat";
import AddRoom from "@/components/AddRoom";
import {addFiles} from "@/utils/file";
import UserProfile from "@/components/UserProfile";


export default {
  name: 'HelloWorld',
  components: {
    UserProfile,
    AddChat,
    AddRoom,
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
    // 新建房间是否展示
    const roomAddVisible = ref(false)
    // 用户信息是否展示
    const userProfileVisible = ref(false)
    const page = ref(0)
    const number = ref(20)
    const editUserProfile = () => {
      userProfileVisible.value = true
    }
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
        if(data.data.length === 0){
          setTimeout(() => {
            messageLoaded.value = true
          })
          return
        }
        data.data.forEach(x => {
          messages.value.unshift(x)
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

          if (!loadedRooms.value[roomIndex].lastMessage) {

            loadedRooms.value[roomIndex] = {
              ...loadedRooms.value[roomIndex],
              lastMessage
            }
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
        const {group, user} = data.data

        const roomIndex = loadedRooms.value.findIndex(r => r.roomId === group.roomId)
        if (roomIndex !== -1) {

          if (loadedRooms.value[roomIndex].friendId === user._id) {
            loadedRooms.value[roomIndex].avatar = user.avatar
            loadedRooms.value[roomIndex].roomName = user.username
          }

          const userIndex = loadedRooms.value[roomIndex].users.findIndex(r => r._id === user._id)
          if (userIndex !== -1) {
            loadedRooms.value[roomIndex].users[userIndex] = user
            loadedRooms.value[roomIndex].users = [...loadedRooms.value[roomIndex].users]
          }
          loadedRooms.value = [...loadedRooms.value]
        }

      })

      // 用户列表
      msg.$on("COMMAND_USER_LIST_RESP", (data) => {
        systemUsers.value = data.data
      })

      // 群组创建成功
      msg.$on("COMMAND_CREATE_GROUP_RESP", (data) => {
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

      // 表情回复
      msg.$on("COMMAND_SEND_MESSAGE_REACTION_RESP", (data) => {
        const reaction = data.data
        if (roomId.value !== reaction.roomId) {
          return
        }
        const messageIndex = messages.value.findIndex(r => reaction.messageId === r._id)
        if (messageIndex === -1) {
          return;
        }

        if (messages.value[messageIndex].reactions) {
          messages.value[messageIndex].reactions = reaction.reactions
        } else {
          messages.value[messageIndex] = {...messages.value[messageIndex], reactions: reaction.reactions}
        }
        messages.value = [...messages.value]
      })

      msg.$on("COMMAND_EDIT_PROFILE_REST", (data) => {
        const {user} = data.data
        curUser.value = {...user}
      })

    }

    init()
    const waitSendMessage = ref([])

    const sendFileMessage = (file, roomId, isLast) => {
      const index = waitSendMessage.value.findIndex(r => r.roomId === roomId)
      if (index === -1) {
        return
      }
      waitSendMessage.value[index].files.push(file)
      if (isLast) {
        sendChatMessage(waitSendMessage.value[index])
        waitSendMessage.value.splice(index, 1)
      }
    }

    const sendMessage = async ({content, roomId, files, replyMessage}) => {
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
        replyMessage: reply,
        files: []
      }

      // 如果存在文件, 则把文件加入到上传列表,等待上传完毕后发送
      if (files) {
        waitSendMessage.value.push(message)
        await addFiles(files, roomId, (file, isOver) => {
          sendFileMessage({
            name: file.name + '.' + file.extension,
            size: file.size,
            type: file.type,
            url: file.url,
          }, roomId, isOver)
        })
      } else {
        sendChatMessage(message)
      }
      upRoom(roomId)
    }

    const addRoom = () => {
      roomAddVisible.value = !roomAddVisible.value
      getUserList()
    }

    const changeRoom = item => {
      messages.value = messages.value.splice(0,messages.value.length)
      messages.value = []
      messageLoaded.value = false
      page.value = 0
      roomId.value = item
      const roomIndex = loadedRooms.value.findIndex(r => item === r.roomId)
      loadedRooms.value[roomIndex].unreadCount = 0;
      loadedRooms.value = [...loadedRooms.value]

      getHistoryMessage({roomId: roomId.value, page: page.value, number: number.value})
      clearUnReadMessage(roomId.value)
    }

    const addChat = () => {
      chatAddVisible.value = !chatAddVisible.value
      getUserList()
    }

    const createChat = item => {
      chatAddVisible.value = !chatAddVisible.value
      const roomIndex = loadedRooms.value.findIndex(r => item._id === r.friendId)
      if (roomIndex === -1) {
        createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
        return
      }

      upRoom(loadedRooms.value[roomIndex].roomId)
      changeRoom(loadedRooms.value[roomIndex].roomId)
    }

    const fetchMessage = ({ room, options = {} }) => {
      console.log("更多消息",room, options)
      if (room.roomId !== roomId.value) {
        changeRoom(room.roomId)
        return
      }
      page.value += 1
      getHistoryMessage({roomId: roomId.value, page: page.value, number: number.value})
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

    const sendMessageReaction = ({reaction, remove, messageId, roomId}) => {
      messageReaction({reaction: reaction.unicode, remove, messageId, roomId})
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
      roomAddVisible,
      userProfileVisible,
      editUserProfile,
      createChat,
      sendMessage,
      addRoom,
      addChat,
      sendMessageReaction,
      fetchMessage,
      quit,

      icons: {
        mdiWindowClose,
        mdiChevronDown,
        mdiAccount,
      }
    }
  },
}
</script>
<style lang="scss" scoped>

@import "../styles/theme.scss";

.room-header-container {
  position: sticky;
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 15px;
}

.account-img {
  border-radius: 32px;
  background-color: $v-grey-lighten1;
}
</style>
