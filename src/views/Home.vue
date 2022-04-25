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
          :media-preview-enabled="false"
          @room-info="roomInfo"
          @send-message="sendMessage"
          @fetch-messages="fetchMessage"
          @send-message-reaction="sendMessageReaction"
          @delete-message="deleteMessage"
          @open-file="openFile"
      >

        <template #rooms-header="{}">
          <rooms-header :cur-user="curUser"/>
        </template>
        <template #left-drawer="{}">
          <left-drawer ref="leftDrawer"/>
        </template>
        <template #right-drawer="{}">
          <right-drawer ref="rightDrawer" :room="curRoom"/>
        </template>
        <template #room-options="{}">
          <room-options :room-id="roomId" />
        </template>

      </chat-window>
    </div>
    <message-viewer :message="clickMessage" :file="clickFile" @close="closeMessageViewer"></message-viewer>

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
import MessageViewer from "@/components/system/ImViewer";
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
    MessageViewer,
    RoomOptions,
    RoomsHeader,
    TopBar,
    ChatWindow,
  },
  setup() {

    const rightDrawer = ref(null)
    const leftDrawer = ref(null)

    // 点击文件时的消息
    const clickMessage = ref(null)
    // 点击的文件
    const clickFile = ref(null)

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

    const openFile = ({message, file}) => {
      clickMessage.value = message
      clickFile.value = file
    }

    const closeMessageViewer = () => {
      clickMessage.value = null
      clickFile.value = null
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
      clickFile,
      leftDrawer,
      isElectron,
      pageHeight,
      rightDrawer,
      clickMessage,

      upRoom,
      roomInfo,
      openFile,
      changeRoom,
      sendMessage,
      fetchMessage,
      deleteMessage,
      openRightDrawer,
      closeMessageViewer,
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
