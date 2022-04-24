<template>
  <div>
    <drawer-top @close="closeAddChat">
      <user-search @click-content="startChat"></user-search>
    </drawer-top>
    <div class="overflow-y-auto" :style="{height: pageHeight}">
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
import {ref} from "@vue/composition-api";
import DrawerTop from "@/components/drawer/DrawerTop";
import {createGroup} from "@/net/message";
import {changeRoom, loadedRooms, upRoom} from "@/views/home/home";
import UserSelectColumn from "@/components/user/UserSelectColumn";
import UserSearch from "@/components/user/UserSearch";

export default {
  name: "AddChat",
  components: {UserSearch, UserSelectColumn, DrawerTop},
  props: {},
  setup(props, context) {
    const pageHeight = process.env.isElectron ? "calc(100vh - 64px - 32px)" : "calc(100vh - 64px)"
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
      upRoom(room.roomId)
      changeRoom(room.roomId)
      closeAddChat()
    }

    return {
      userSelectModel,
      waitSelect,
      startChat,
      closeAddChat,
      pageHeight,

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
