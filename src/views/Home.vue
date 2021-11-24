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
          @delete-message="deleteMessage"
          @open-file="openFile"
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
    <message-viewer :message="clickMessage" :file="clickFile" @close="closeMessageViewer"></message-viewer>
  </div>
</template>

<script>
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'
import {computed, nextTick, onMounted, ref} from "@vue/composition-api";
import TopBar from "../components/system/TopBar";
import msg from "@/plugins/msg";
import localStoreUtil from "@/utils/local-store";
import {
  buildLastMessage, buildLastMessageTime,
  clearUnReadMessage,
  getHistoryMessage,
  getUserInfo, messageDelete,
  messageReaction,
  sendChatMessage
} from "@/net/message";
import {mdiAccount, mdiWindowClose} from "@mdi/js";

import {addFiles} from "@/utils/file";
import textMessage from "@/locales/text-message";
import messageAction from "@/locales/message-action";
import RoomsHeader from "@/components/RoomsHeader";
import RoomOptions from "@/components/RoomOptions";
import MessageViewer from "@/components/message/MessageViewer";

export default {
  name: 'Home',
  components: {
    MessageViewer,
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
    const sendPage = ref(-1)
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
    // 点击文件时的消息
    const clickMessage = ref(null)
    // 点击的文件
    const clickFile = ref(null)

    let isElectron = ref(process.env.IS_ELECTRON);


    onMounted(() => {
      currentUserId.value = localStoreUtil.getValue('userId')
      getUserInfo(currentUserId.value)

      // 获取用户信息响应
      msg.$on("COMMAND_GET_USER_RESP", (data) => {
        const {groups} = data.data

        curUser.value = data.data
        console.log('groups', groups)
        groups.forEach(x => {
          x.lastMessage = buildLastMessageTime(x.lastMessage)
        })
        loadedRooms.value = [...groups]
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
        console.log(data.data,'data.data')
        if (data.data.length === 0) {
          setTimeout(() => {
            messageLoaded.value = true
          })
          return
        }
        page.value += 1
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
            loadedRooms.value[roomIndex].users = sortedUser(loadedRooms.value[roomIndex].users)
          }
          loadedRooms.value = [...loadedRooms.value]
        }
      })

      // 加入群组返回
      msg.$on("COMMAND_JOIN_GROUP_NOTIFY_RESP", (data) => {
        let room = data.data.group
        let users = data.data.users
        const index = loadedRooms.value.findIndex(r => r.roomId === room.roomId);
        if (index === -1) {
          room.users = users
          loadedRooms.value[loadedRooms.value.length] = room
          loadedRooms.value = [...loadedRooms.value]
        } else {
          loadedRooms.value[index].users.push(...users)
          loadedRooms.value[index].users = sortedUser(loadedRooms.value[index].users)
          loadedRooms.value = [...loadedRooms.value]
        }
        setTimeout(() => {
          loadingRooms.value = false
          roomsLoaded.value = true
        })
        if (loadedRooms.value.length === 1) {
          changeRoom(room.roomId)
        }

        // 如果加入的用户里包含创建者，那么切换位置
        const userIndex = users.findIndex(r => r._id === currentUserId.value);
        if (userIndex !== -1) {
          const user = users[userIndex];
          if (user.role === 'ADMIN') {
            changeRoom(room.roomId)
          }
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
        const {userId} = data.data
        const room_id = data.data.roomId
        const index = loadedRooms.value.findIndex(r => r.roomId === room_id);
        if (userId === currentUserId.value) {
          loadedRooms.value.splice(index, 1)
          loadedRooms.value = [...loadedRooms.value]
          if (room_id === roomId.value) {
            if (loadedRooms.value.length > 0) {
              changeRoom(loadedRooms.value[0].roomId)
            }
          }

          return
        }
        const userIndex = loadedRooms.value[index].users.findIndex(r => r._id === userId);
        loadedRooms.value[index].users.splice(userIndex, 1)

        loadedRooms.value = [...loadedRooms.value]

      })

      // 解散群聊响应
      msg.$on('COMMAND_DISBAND_GROUP_RESP', (data) => {
        const {roomId: disbandRoomId} = data.data
        const index = loadedRooms.value.findIndex(r => r.roomId === disbandRoomId);
        loadedRooms.value.splice(index, 1)
        loadedRooms.value = [...loadedRooms.value]

        if (disbandRoomId === roomId.value) {
          changeRoom(loadedRooms.value[0]?.roomId)
        }
      })

      // 移交群主响应
      msg.$on('COMMAND_HANDOVER_GROUP_RESP', (data) => {
        const {roomId, oldAdmin, newAdmin} = data.data
        const index = loadedRooms.value.findIndex(r => r.roomId === roomId);

        const oldAdminIndex = loadedRooms.value[index].users.findIndex(r => r._id === oldAdmin);
        loadedRooms.value[index].users[oldAdminIndex].role = 'GENERAL'

        const newAdminIndex = loadedRooms.value[index].users.findIndex(r => r._id === newAdmin);
        loadedRooms.value[index].users[newAdminIndex].role = 'ADMIN'

        loadedRooms.value[index].users = sortedUser(loadedRooms.value[index].users)
        loadedRooms.value = [...loadedRooms.value]

      })

      // 修改群组信息响应
      msg.$on('COMMAND_EDIT_GROUP_PROFILE_RESP', (data) => {
        const {roomId, roomName, avatar} = data.data
        const index = loadedRooms.value.findIndex(r => r.roomId === roomId);
        loadedRooms.value[index].roomName = roomName
        loadedRooms.value[index].avatar = avatar

        loadedRooms.value = [...loadedRooms.value]
      })

      // 删除群组信息响应
      msg.$on('COMMAND_MESSAGE_DELETE_RESP', (data) => {
        const {_id, roomId: messageRoomId} = data.data
        if (messageRoomId === roomId.value) {
          const index = messages.value.findIndex(r => r._id === _id);
          if (index !== -1) {
            messages.value[index].deleted = true
            messages.value = [...messages.value]
          }
        }
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
          files: replyMessage.files
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
        console.log(files, 'files')
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
      sendPage.value = 0
      roomId.value = item
      const roomIndex = loadedRooms.value.findIndex(r => item === r.roomId)
      loadedRooms.value[roomIndex].users = sortedUser(loadedRooms.value[roomIndex].users)
      loadedRooms.value[roomIndex].users = [...loadedRooms.value[roomIndex].users]
      loadedRooms.value[roomIndex].unreadCount = 0;
      loadedRooms.value = [...loadedRooms.value]

      getHistoryMessage({roomId: roomId.value, page: page.value, number: number.value})
      clearUnReadMessage(roomId.value)
    }

    const sortedUser = (users) => {
      return users.sort((x, y) => {
        // 如果是群主，优先在最前面
        if (x.role === 'ADMIN' || y.role === 'ADMIN') {
          return x.role === 'ADMIN' ? -1 : 1
          // 如果两个角色相等 判断在线状态
        } else if (x.role === y.role) {
          // 在线的优先于不在线的
          if (x.status.state !== y.status.state) {
            return x.status.state === 'online' ? -1 : 1
          } else {
            return x.username.localeCompare(y.username, 'zh')
          }
        }
      })
    }

    // 查找更多消息
    const fetchMessage = ({room}) => {
      console.log('查找系统消息')
      if (room.roomId !== roomId.value) {
        changeRoom(room.roomId)
        return
      }
      if (page.value === sendPage.value) {
        return
      }
      sendPage.value = page.value
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

    const deleteMessage = ({message}) => {
      console.log(message, 'message')
      messageDelete({messageId: message._id});
    }

    const openFile = ({message, file}) => {
      console.log(message, file)
      clickMessage.value = message
      clickFile.value = file
    }

    const closeMessageViewer = () => {
      clickMessage.value = null
      clickFile.value = null
    }

    const styles = ref({
      container: {
        boxShadow: ''
      },
    })

    const pageHeight = isElectron.value ? 'calc(100vh - 32px)' : '100vh'

    return {
      clickMessage,
      clickFile,
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
      closeMessageViewer,
      deleteMessage,
      openFile,
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
