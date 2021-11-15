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
          :room-info-enabled="false"
          :show-audio="false"
          @send-message="sendMessage"
          @fetch-messages="fetchMessage"
          @send-message-reaction="sendMessageReaction"
      >

        <template #rooms-header="{}">
          <rooms-header
              :cur-user="curUser"
              :system-users="systemUsers"
              :loaded-rooms="loadedRooms"
              @up-room="upRoom"
              @change-room="changeRoom"
          >
          </rooms-header>
        </template>
        <template #room-options="{}">
          <room-options
              :system-users="systemUsers"
              :room-id="roomId"
              :loaded-rooms="loadedRooms"
              @up-room="upRoom"
              @change-room="changeRoom"
          >
          </room-options>
        </template>
      </chat-window>


    </div>
  </div>
</template>

<script>
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'
import {nextTick, onMounted, computed, ref} from "@vue/composition-api";
import TopBar from "../components/system/TopBar";
import msg from "@/plugins/msg";
import localStoreUtil from "@/utils/local-store";
import {
  buildLastMessage,
  clearUnReadMessage,
  getHistoryMessage,
  getUserInfo,
  messageReaction,
  sendChatMessage
} from "@/net/message";
import {mdiAccount, mdiWindowClose} from "@mdi/js";

import {addFiles} from "@/utils/file";
import textMessage from "@/locales/text-message";
import messageAction from "@/locales/message-action";
import RoomsHeader from "@/components/RoomsHeader";
import RoomOptions from "@/components/RoomOptions";

export default {
  name: 'Home',
  components: {
    RoomOptions,
    RoomsHeader,
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
    // 当前消息页数
    const page = ref(0)
    // 当前消息分页数
    const number = ref(20)
    // 加载动画
    const loadingRooms = ref(false)
    // 房间列表是否加载完成
    const roomsLoaded = ref(true)
    // 消息内容
    const textMessages = computed(() => {
      return {...textMessage}
    })
    // 消息操作按钮
    const messageActions = computed(() => {
      return [...messageAction]
    })

    // 系统用户列表
    const systemUsers = ref([])

    const waitSendMessage = ref([])


    let isElectron = ref(process.env.IS_ELECTRON);


    onMounted(() => {
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
        if (data.data.length === 0) {
          setTimeout(() => {
            messageLoaded.value = true
          })
          return
        }
        data.data.forEach(x => {
          const index = messages.value.findIndex(r => r._id === x._id);
          if (index === -1) {
            messages.value.unshift(x)
          }
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
        console.log(data)
/*        let room = data.data
        loadedRooms.value[loadedRooms.value.length] = room
        loadedRooms.value = [...loadedRooms.value]

        setTimeout(() => {
          loadingRooms.value = false
          roomsLoaded.value = true
        })
        changeRoom(room.roomId)*/
      })

      // 加入群组返回
      msg.$on("COMMAND_JOIN_GROUP_NOTIFY_RESP", (data) => {
        let room = data.data.group
        const index = loadedRooms.value.findIndex(r => r.roomId === room.roomId);
        if (index === -1) {
          loadedRooms.value[loadedRooms.value.length] = room
          loadedRooms.value = [...loadedRooms.value]
        } else {
          console.log('查找到群组')
          loadedRooms.value[index].users = room.users
          loadedRooms.value = [...loadedRooms.value]
        }
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

      // 编辑用户信息返回
      msg.$on("COMMAND_EDIT_PROFILE_REST", (data) => {
        const {user} = data.data
        curUser.value = {...user}
      })

      // 群组用户移除返回
      msg.$on("COMMAND_REMOVE_GROUP_USER_RESP", (data) => {
        const { userId} = data.data
        const room_id = data.data.roomId
        console.log('COMMAND_REMOVE_GROUP_USER_RESP',room_id, userId)
        const index = loadedRooms.value.findIndex(r => r.roomId === room_id);
        if (userId === currentUserId.value) {
          console.log('小丑竟然是我自己?')
          loadedRooms.value.splice(index, 1)
          loadedRooms.value = [...loadedRooms.value]
          if(room_id === roomId.value ){
            console.log('123')
            if(loadedRooms.value.length > 0){
              changeRoom(loadedRooms.value[0].roomId)
            }
          }

          return
        }
        const userIndex = loadedRooms.value[index].users.findIndex(r => r._id === userId);
        loadedRooms.value[index].users.splice(userIndex, 1)

        loadedRooms.value = [...loadedRooms.value]

      })

    })

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
    const changeRoom = item => {
      messages.value = messages.value.splice(0, messages.value.length)
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

    const fetchMessage = ({room, options = {}}) => {
      console.log("更多消息", room, options)
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
      console.log('find', roomId)
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

    const styles = ref({
      container: {
        boxShadow: ''
      },
    })

    const pageHeight = isElectron.value ? 'calc(100vh - 32px)' : '100vh'

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
      curUser,
      systemUsers,
      messageActions,
      sendMessage,
      sendMessageReaction,
      fetchMessage,
      upRoom,
      changeRoom,

      icons: {
        mdiWindowClose,
        mdiAccount,
      }
    }
  },
}
</script>
<style lang="scss" scoped>

@import "../styles/theme.scss";

.account-img {
  border-radius: 32px;
  background-color: $v-grey-lighten1;
}

</style>
