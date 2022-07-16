<template>
  <add-room-select-user
      ref="selectUser"
      :icon="icons.mdiCheck"
      :room="room"
      @to-go="inviteUser('ROOM_INFO',$event)"
      @close="resetAndOpen('ROOM_INFO')"/>
</template>

<script>
import AddRoomSelectUser from "@/components/leftDrawer/addRoom/AddRoomSelectUser";
import {computed, ref} from "@vue/composition-api";
import {mdiCheck} from "@mdi/js";
import {joinUserGroup} from "@/net/send-message";
import store from "@/store";

export default {
  name: "GroupInviteUser",
  components: {
    AddRoomSelectUser
  },
  setup() {

    const room = computed(()=> store.getters.curRoom)
    
    const selectUser = ref(null)

    const inviteUser = (item, userSelect) => {

      const users = userSelect.map(x => {
        return {
          _id: x._id
        }
      })
      const group = {
        roomId: room.value.roomId
      }

      joinUserGroup({group, users})

      resetAndOpen(item)
    }

    const open = (item) => {
      store.commit('setInformationPane', item)
    }

    const resetAndOpen = (item) => {
      selectUser.value.clearUserSelect()
      open(item)
    }

    return {

      room,
      resetAndOpen,
      selectUser,
      close,
      inviteUser,

      icons: {
        mdiCheck
      }
    }
  }
}
</script>

<style scoped>

</style>
