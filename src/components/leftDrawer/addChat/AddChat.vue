<template>
  <div>
    <drawer-top @close="closeAddChat">
      <user-search @click-content="startChat"></user-search>
    </drawer-top>
    <div class="overflow-y-auto fill-height">
      <user-select-column>
        <div slot="userAction" slot-scope="{item}">
          <v-btn icon @click="startChat(item)">
            <v-icon>{{ icons.mdiChatOutline }}</v-icon>
          </v-btn>
        </div>
      </user-select-column>
    </div>
  </div>
</template>

<script>
import {mdiChatOutline, mdiMagnify} from "@mdi/js";
import {computed, ref} from "@vue/composition-api";
import DrawerTop from "@/components/drawer/DrawerTop";
import {createGroup} from "@/net/send-message";
import UserSelectColumn from "@/components/user/UserSelectColumn";
import UserSearch from "@/components/user/UserSearch";
import store from "@/store";

export default {
  name: "AddChat",
  components: {UserSearch, UserSelectColumn, DrawerTop},
  props: {},
  setup(props, context) {
    const loadedRooms = computed(() => store.state.loadedRooms)
    const userSelectModel = ref(false)

    const waitSelect = ref([])

    const closeAddChat = () => {
      context.emit('close')
    }

    const startChat = item => {
      const room = loadedRooms.value.find(r => item._id === r.friendId)
      if (!room) {
        createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
        closeAddChat()
        return
      }
      store.commit('upRoom', room.roomId)
      store.commit('changeRoom',room.roomId)
      closeAddChat()
    }

    return {
      userSelectModel,
      waitSelect,
      startChat,
      closeAddChat,

      icons: {
        mdiMagnify,
        mdiChatOutline,
      },
    }
  }
}
</script>

<style lang="scss" scoped>

.no-drag {
  -webkit-app-region: no-drag;
}
</style>
