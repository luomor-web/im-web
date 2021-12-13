<template>
  <div>
    <drawer-top @close="closeAddChat">
      <user-search></user-search>
    </drawer-top>
    <div>
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
import {onMounted, ref} from "@vue/composition-api";
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

    const userSelectModel = ref(false)

    const waitSelect = ref([])

    const closeAddChat = () => {
      console.log('close chat')
      context.emit('close')
    }

    const startChat = item => {
      console.log(loadedRooms.value, item)
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

    onMounted(() => {

    })

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
