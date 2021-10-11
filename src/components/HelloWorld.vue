<template>
  <chat-window
      :current-user-id="currentUserId"
      :rooms="rooms"
      :messages="messages"
  />
</template>

<script>
import ChatWindow from 'vue-advanced-chat'
import 'vue-advanced-chat/dist/vue-advanced-chat.css'
import {ref} from "@vue/composition-api";

export default {
  name: 'HelloWorld',
  components: {
    ChatWindow
  },
  setup() {
    const currentUserId = ref(1234)
    const rooms = ref([])
    const messages = ref([])

    return {
      currentUserId,
      rooms,
      messages
    }
  },
}
</script>
