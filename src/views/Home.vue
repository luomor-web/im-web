<template>
  <div>
    <div v-if="isElectron">
      <top-bar></top-bar>
    </div>
    <div>
      <audio class="d-none" id="audio" controls="controls" :src="require('@/assets/music/tip.wav')"></audio>
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
          :room-info-enabled="true"
          :media-preview-enabled="false"
          @room-info="roomInfo"
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
              @goto="leftGoTo"
              @up-room="upRoom"
              @change-room="changeRoom"
          />
        </template>

        <template #left-drawer="{}">
          <left-drawer
              :active="leftActive"
              @close="closeLeftDrawer"
          />
        </template>
        <room-options-control />
      </chat-window>
    </div>
    <message-viewer :message="clickMessage" :file="clickFile" @close="closeMessageViewer"></message-viewer>
    <im-video-dialog ref="videoDialog" :room="curRoom"></im-video-dialog>
  </div>
</template>

<script>
import ChatWindow from 'alispig-advanced-chat'
import 'alispig-advanced-chat/dist/vue-advanced-chat.css'
import {computed, onMounted, onUnmounted, ref} from "@vue/composition-api";
import TopBar from "../components/system/TopBar";
import localStoreUtil from "@/utils/local-store";
import {
  getHistoryMessage,
  getUserInfo,
  getUserList,
  messageDelete,
  messageReaction,
  sendChatMessage
} from "@/net/message";
import {mdiAccount, mdiWindowClose} from "@mdi/js";
import {addFiles} from "@/utils/file";
import {textMessages} from "@/locales/text-message";
import {messageActions} from "@/locales/message-action";
import RoomsHeader from "@/components/RoomsHeader";
import MessageViewer from "@/components/system/ImViewer";
import {
  changeRoom,
  currentUserId,
  curUser,
  loadedRooms,
  loadingRooms,
  messageLoaded,
  messages,
  number,
  page,
  roomId,
  roomsLoaded,
  sendPage,
  upRoom,
  waitSendMessage
} from "@/views/home/home";
import {destroy, init} from "@/views/home/on-message";
import {uuid} from "@/utils/id-util";
import moment from "moment";
import LeftDrawer from "@/components/leftDrawer/LeftDrawer";
import ImVideoDialog from "@/components/system/ImVideoDialog";
import RoomOptionsControl from "@/components/roomOptions/RoomOptionsControl";

export default {
  name: 'Home',
  components: {
    RoomOptionsControl,
    LeftDrawer,
    MessageViewer,
    RoomsHeader,
    TopBar,
    ChatWindow,
    ImVideoDialog,
  },
  setup() {

    // 系统用户列表
    const systemUsers = ref([])
    // 点击文件时的消息
    const clickMessage = ref(null)
    // 点击的文件
    const clickFile = ref(null)

    const rightDrawer = ref(null)

    const leftActive = ref('')
    const videoDialog = ref(null)

    let isElectron = ref(process.env.IS_ELECTRON);

    onMounted(() => {
      currentUserId.value = localStoreUtil.getValue('userId')
      getUserInfo(currentUserId.value)
      getUserList()
      init()
    })

    const sendFileMessage = (file, roomId, isLast) => {
      const index = waitSendMessage.value.findIndex(r => r.roomId === roomId)
      if (index === -1) return

      const fileIndex = waitSendMessage.value[index].files.findIndex(f => f.id === file.id);
      if (fileIndex === -1) return

      waitSendMessage.value[index].files[fileIndex] = file
      if (!isLast) return

      sendChatMessage(waitSendMessage.value[index])

      // waitSendMessage.value.splice(index, 1)
    }

    const leftGoTo = item => {
      leftActive.value = item
    }

    const updateProgress = (file, messageId) => {
      const message = messages.value.find(r => r._id === messageId);
      if (!message || !message.files) return

      message.files.find(r => r.id === file.id).progress = file.progress
      messages.value = [...messages.value]
    }

    const operationMessage = async message => {

      messages.value.push(message)
      waitSendMessage.value.push(message)

      if (!message.files) {
        sendChatMessage(message)
        return
      }

      await addFiles(message.files, (file, isOver) => {

        if (file.progress) {
          updateProgress(file, message._id)
          return
        }

        sendFileMessage({
          id: file.id,
          name: file.name + '.' + file.extension,
          size: file.size,
          type: file.type,
          url: file.url,
          progress: file.progress
        }, message.roomId, isOver)

      })
    }

    const sendMessage = async ({content, roomId, files, replyMessage}) => {
      // 如果发送了文件, 那么给每一个文件生成一个ID
      files?.forEach(x => {
        x.id = uuid()
        x.url = x.localUrl
      })

      const message = {
        senderId: currentUserId.value,
        content,
        roomId,
        replyMessage: replyMessage,
        files: files
      }

      // 如果存在文件, 则把文件加入到上传列表,等待上传完毕后发送

      // 构建消息, 添加到消息列表中
      message._id = uuid()
      message.system = false
      message.date = moment().format("YYYY-MM-DD")
      message.username = curUser.value.username
      message.avatar = curUser.value.avatar
      message.timestamp = '...'

      upRoom(roomId)

      await operationMessage(message)

    }

    const curRoom = computed(() => {
      return loadedRooms.value.find(r => r.roomId === roomId.value)
    })

    const curRoomIsSystem = computed(() => {
      console.log(curRoom.value, 'isSystem')
      return !curRoom.value?.isSystem
    })

    // 查找更多消息
    const fetchMessage = ({room}) => {
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

    const sendMessageReaction = ({reaction, remove, messageId, roomId}) => {
      messageReaction({reaction: reaction.unicode, remove, messageId, roomId})
    }

    const deleteMessage = ({message}) => {
      messageDelete({messageId: message._id});
    }

    const openFile = ({message, file}) => {
      clickMessage.value = message
      clickFile.value = file
    }

    const closeMessageViewer = () => {
      clickMessage.value = null
      clickFile.value = null
    }

    const roomInfo = () => {
      console.log('roomsInfo')
      rightDrawer.value.roomInfo()
    }

    const closeLeftDrawer = item => {
      leftActive.value = item
    }

    const call = (roomId, type) => {
      videoDialog.value.call(type)
    }

    const styles = ref({
      container: {
        boxShadow: ''
      },
    })

    onUnmounted(() => {
      destroy()
    })

    const pageHeight = isElectron.value ? 'calc(100vh - 32px)' : '100vh'

    return {
      rightDrawer,
      videoDialog,
      messages,
      messageLoaded,
      curUser,
      currentUserId,
      roomId,
      textMessages,
      loadedRooms,
      messageActions,
      loadingRooms,
      roomsLoaded,
      curRoomIsSystem,
      curRoom,
      leftActive,
      clickMessage,
      clickFile,
      isElectron,
      pageHeight,
      styles,
      systemUsers,
      call,
      leftGoTo,
      roomInfo,
      closeLeftDrawer,
      closeMessageViewer,
      openFile,
      deleteMessage,
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
