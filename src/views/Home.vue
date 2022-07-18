<template>
  <div>
    <top-bar v-if="isElectron"/>
    <chat-window
      :height="pageHeight"
      :current-user-id="currentUserId"
      :show-add-room="false"
      :room-id="roomId"
      :rooms="loadedRooms"
      :loading-rooms="loadingRooms"
      :messages="messages"
      :messages-loaded="messageLoaded"
      :rooms-loaded="roomsLoaded"
      :text-messages="textMessages"
      :message-actions="messageActions"
      :message-selection-actions="messageSelectionActions"
      :room-info-enabled="true"
      :search-message="searchMessage"
      @open-failed-message="openFailedMessage"
      @room-info="roomInfo"
      @send-message="sendMessage"
      @fetch-messages="fetchMessage"
      @send-message-reaction="sendMessageReaction"
      @delete-message="deleteMessage"
      @message-selection-action-handler="messageSelectionActionHandler"
      @open-file="openFile"
      @click-scroll-icon="clickScrollIcon"
    >

      <template #rooms-header="{}">
        <rooms-header/>
      </template>
      <template #setting-pane="{}">
        <setting-pane />
      </template>
      <template #information-pane="{}">
        <information-pane/>
      </template>
      <template #room-options="{}">
        <room-options/>
      </template>
      <template #float-action="{}">
        <float-menu />
      </template>
    </chat-window>
    <im-component ref="imComponent"/>
  </div>
</template>

<script>
import ChatWindow from 'alispig-advanced-chat'
import 'alispig-advanced-chat/dist/vue-advanced-chat.css'
import {computed, onMounted, ref} from "@vue/composition-api";
import TopBar from "../components/basic/TopBar";
import {
  getHistoryMessage,
  getUserInfo,
  messageDelete,
  messageReaction,
  sendChatMessage
} from "@/net/send-message";
import {textMessages} from "@/locales/text-message";
import {messageActions} from "@/locales/message-action";
import {messageSelectionActions} from "@/locales/message-selection-action";
import RoomsHeader from "@/components/RoomsHeader";
import RoomOptions from "@/components/RoomOptions";
import InformationPane from "@/components/InformationPane";
import SettingPane from "@/components/SettingPane";
import download from "@/utils/download";
import store from "@/store";
import {uploadFiles} from "@/utils/upload";
import {uuid} from "@/utils/id-util";
import moment from "moment";
import ImComponent from "@/components/ImComponent";
import FloatMenu from "@/components/basic/FloatMenu";

export default {
  name: 'Home',
  components: {
    ImComponent,
    SettingPane,
    InformationPane,
    RoomOptions,
    RoomsHeader,
    TopBar,
    ChatWindow,
    FloatMenu
  },
  setup() {

    const isElectron = ref(process.env.IS_ELECTRON);
    const pageHeight = isElectron.value ? 'calc(100vh - 32px)' : '100vh'
    const imComponent = ref(null)
    const roomId = computed(() => store.state.roomId)
    const currentUserId = computed(() => store.state.currentUserId)
    const messageLoaded = computed(() => store.state.messageLoaded)
    const searchMessage = computed(() => store.state.searchMessage)
    const roomsLoaded = computed(() => store.state.roomsLoaded)
    const loadingRooms = computed(() => store.state.loadingRooms)
    const loadedRooms = computed(() => store.state.loadedRooms)
    const messages = computed(() => store.state.messages)
    const curUser = computed(() => store.state.curUser)
    const informationPane = computed(() => store.state.informationPane)

    onMounted(() => {
      getUserInfo(currentUserId.value)
    })

    const deleteMessage = ({message}) => {
      messageDelete({messageId: message._id});
    }

    const roomInfo = () => {
      if (informationPane.value) {
        store.commit('setInformationPane', '')
        return
      }
      store.commit('setInformationPane', 'ROOM_INFO')
    }

    const messageSelectionActionHandler = ({roomId, action, messages}) => {
      console.log(roomId, action, messages)
      if (action.name === "forwardMessages") {
        imComponent.value.selectUser()
      }
    }

    const openFile = ({file}) => {
      if (file.action !== 'download') return
      if (process.env.IS_ELECTRON) {

        imComponent.value.selectDownloadPath(file.file)
        return
      }
      download.download(file.file)
    }

    const clickScrollIcon = ({roomId}) => {
      setTimeout(() => {
        store.commit('clearMessages')
      })
      getHistoryMessage({roomId: roomId, returnDefault: true})
    }

    const sendMessageReaction = ({reaction, remove, messageId, roomId}) => {
      messageReaction({reaction: reaction.unicode, remove, messageId, roomId})
    }

    const fetchMessage = ({room, options = {}}) => {
      if (options.reset && room.roomId !== roomId.value) {
        store.commit('changeRoom', room.roomId)
        return
      }
      // 向下刷
      const messageId = options.type === 'down' ? messages.value[messages.value.length - 1]?._id : messages.value[0]?._id
      getHistoryMessage({roomId: roomId.value, type: options.type, messageId})
    }

    const openFailedMessage = async ({message}) => {
      store.commit('removeWaitSendMessage', message._id)
      store.commit('removeMessage', message._id)

      message.failure = false
      await operationMessage(message)
    }

    const sendMessage = async ({content, roomId, files, replyMessage}) => {
      // 如果发送了文件, 那么给每一个文件生成一个ID
      files?.forEach(x => {
        x.id = uuid()
        x.url = x.localUrl
      })

      const message = {
        senderId: currentUserId.value, content, roomId, replyMessage: replyMessage, files: files
      }

      // 如果存在文件, 则把文件加入到上传列表,等待上传完毕后发送
      // 构建消息, 添加到消息列表中
      message._id = uuid()
      message.system = false
      message.date = moment().format("YYYY-MM-DD")
      message.username = curUser.value.username
      message.avatar = curUser.value.avatar
      message.timestamp = '...'

      store.commit('upRoom', roomId)

      await operationMessage(message)
    }

    const operationMessage = async message => {

      store.commit('pushMessage', message)

      if (!message.files) {
        store.commit('addWaitSendMessage', {message})
        sendChatMessage(message)
        return
      }
      store.commit('addWaitSendMessage', {message, haveFile: true})
      await uploadFiles(message.files, (file, isOver) => {
        if (file.progress) {
          store.commit('updateMessageFileProgress', {file, messageId: message._id})
          return
        }

        store.commit('sendFileMessage', {
          file: {
            id: file.id,
            name: file.name + (file.extension ? '.' : '') + file.extension,
            size: file.size,
            type: file.type,
            url: file.url,
            progress: file.progress
          }, roomId: message.roomId, isLast: isOver
        })

        // 捕获发送过程中的异常, 消息发送失败处理
      }).catch(() => {
        store.commit('handleFailMessage', message._id)
      })
    }

    return {
      messages,
      messageLoaded,
      currentUserId,
      roomId,
      loadingRooms,
      searchMessage,
      roomsLoaded,
      loadedRooms,
      imComponent,

      textMessages,
      messageActions,
      messageSelectionActions,

      isElectron,
      pageHeight,

      roomInfo,
      openFile,
      sendMessage,
      openFailedMessage,
      fetchMessage,
      deleteMessage,
      clickScrollIcon,
      sendMessageReaction,
      messageSelectionActionHandler,

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
