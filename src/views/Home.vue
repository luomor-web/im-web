<template>
  <div>
    <div v-if="isElectron">
      <top-bar></top-bar>
    </div>
    <div>
      <chat-window
          :height="pageHeight"
          :current-user-id="currentUserId"
          :room-id="roomId"
          :rooms="loadedRooms"
          :loading-rooms="loadingRooms"
          :messages="messages"
          :messagesLoaded="messageLoaded"
          :rooms-loaded="roomsLoaded"
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
import { sendMsg } from "@/net/socket";


export default {
  name: 'HelloWorld',
  components: {
    TopBar,
    ChatWindow
  },
  setup() {
    const currentUserId = ref(1234)
    const loadedRooms = ref([])
    const roomId = ref('')
    const messages = ref([])
    const username = ref("")
    const messageLoaded = ref(false)
    const loadingRooms = ref(true)
    const roomsLoaded = ref(true)

    console.log(process.env)

    let isElectron = ref(process.env.IS_ELECTRON);
    console.log(isElectron.value)

    const init = () => {
      username.value = localStoreUtil.getValue('username')
      console.log(username.value)
      // 发送获取用户信息
      let param = {
        cmd: 17,
        userId: username.value,
      }
      sendMsg(param)

      msg.$on("COMMAND_GET_USER_RESP",(data) => {
        console.log(data, 'data')
        loadedRooms.value = data.data.groups
        loadingRooms.value = false
      })

    }

    init()

    const pageHeight = isElectron ?  'calc(100vh - 48px)' : '100vh'

    return {
      currentUserId,
      loadedRooms,
      roomId,
      loadingRooms,
      messages,
      isElectron,
      pageHeight,
      messageLoaded,
      roomsLoaded
    }
  },
}
</script>
<style scoped>
.chat-window {
  height: calc(100vh - 64px);
}
</style>
