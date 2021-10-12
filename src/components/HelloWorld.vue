<template>
  <div>
    <div v-if="isElectron">
      <top-bar></top-bar>
    </div>
    <div>
      <chat-window
          :height="pageHeight"
          :current-user-id="currentUserId"
          :rooms="rooms"
          :messages="messages"
      />
    </div>
  </div>
</template>

<script>
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'
import {ref} from "@vue/composition-api";
import TopBar from "./TopBar";

export default {
  name: 'HelloWorld',
  components: {
    TopBar,
    ChatWindow
  },
  setup() {
    const currentUserId = ref(1234)
    const rooms = ref([])
    const messages = ref([])

    let isElectron;
    try {
      isElectron = window.require('electron').ipcRenderer;
    } catch (e) {
      isElectron = false
    }

    const pageHeight = isElectron ?  'calc(100vh - 64px)' : '100vh'

    return {
      currentUserId,
      rooms,
      messages,
      isElectron,
      pageHeight
    }
  },
}
</script>
<style scoped>
.chat-window {
  height: calc(100vh - 64px);
}
</style>
