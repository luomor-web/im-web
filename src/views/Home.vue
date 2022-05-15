<template>
  <div>
    <top-bar v-if="isElectron"></top-bar>
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
          @room-info="roomInfo"
          @send-message="sendMessage"
          @fetch-messages="fetchMessage"
          @send-message-reaction="sendMessageReaction"
          @delete-message="deleteMessage"
          @open-file="openFile"
      >

        <template #rooms-header="{}">
          <rooms-header ref="roomHeader" :cur-user="curUser" />
        </template>
        <template #left-drawer="{}">
          <left-drawer ref="leftDrawer"/>
        </template>
        <template #right-drawer="{}">
          <right-drawer ref="rightDrawer" :room="curRoom"/>
        </template>
        <template #room-options="{}">
          <room-options :room-id="roomId"/>
        </template>

      </chat-window>

    </div>
  </div>
</template>

<script>
import ChatWindow from 'alispig-advanced-chat'
import 'alispig-advanced-chat/dist/vue-advanced-chat.css'
import {computed, onMounted, onUnmounted, provide, ref} from "@vue/composition-api";
import TopBar from "../components/system/TopBar";
import localStoreUtil from "@/utils/local-store";
import {getUserInfo, getUserList, messageDelete} from "@/net/send-message";
import {mdiAccount, mdiWindowClose} from "@mdi/js";
import {textMessages} from "@/locales/text-message";
import {messageActions} from "@/locales/message-action";
import RoomsHeader from "@/components/RoomsHeader";
import RoomOptions from "@/components/RoomOptions";
import {
  changeRoom,
  currentUserId,
  curUser,
  loadedRooms,
  loadingRooms,
  messageLoaded,
  messages,
  roomId,
  roomsLoaded,
  upRoom
} from "@/views/home/home";
import {init, msgDestroy} from "@/views/home/on-message";
import RightDrawer from "@/components/rightDrawer/RightDrawer";
import LeftDrawer from "@/components/leftDrawer/LeftDrawer";
import {fetchMessage, sendMessage, sendMessageReaction} from "@/views/home/message";

export default {
  name: 'Home',
  components: {
    LeftDrawer,
    RightDrawer,
    RoomOptions,
    RoomsHeader,
    TopBar,
    ChatWindow,
  },
  setup() {

    const roomHeader = ref(null)
    const rightDrawer = ref(null)
    const leftDrawer = ref(null)
    const downloadAction = ref(false)

    let isElectron = ref(process.env.IS_ELECTRON);

    onMounted(() => {
      currentUserId.value = localStoreUtil.getValue('userId')
      getUserInfo(currentUserId.value)
      getUserList()
      init()
    })

    const curRoom = computed(() => {
      return loadedRooms.value.find(r => r.roomId === roomId.value)
    })

    const deleteMessage = ({message}) => {
      messageDelete({messageId: message._id});
    }

    const roomInfo = () => {
      rightDrawer.value.roomInfo()
    }

    const openRightDrawer = (item) => {
      rightDrawer.value.open(item)
    }
    provide('openRightDrawer', openRightDrawer)

    const openLeftDrawer = (item) => {
      leftDrawer.value.open(item)
    }
    provide('openLeftDrawer', openLeftDrawer)

    const openFile = ({file}) => {
      if (file.action !== 'download') return
      roomHeader.value.selectDownloadPath(file.file)
      // download.download(file.file)
    }

    const styles = ref({
      container: {
        boxShadow: ''
      },
    })

    onUnmounted(() => {
      msgDestroy()
    })

    const pageHeight = isElectron.value ? 'calc(100vh - 32px)' : '100vh'

    return {
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


      styles,
      curRoom,
      roomHeader,
      leftDrawer,
      isElectron,
      pageHeight,
      rightDrawer,
      downloadAction,

      upRoom,
      roomInfo,
      openFile,
      changeRoom,
      sendMessage,
      fetchMessage,
      deleteMessage,
      openRightDrawer,
      sendMessageReaction,


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
