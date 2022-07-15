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
import { inject, ref } from "@vue/composition-api";
import { mdiCheck } from "@mdi/js";
import { joinUserGroup } from "@/net/send-message";

export default {
  name: "GroupInviteUser",
  props: {
    room: Object,
  },
  components: {
    AddRoomSelectUser
  },
  setup(props) {

    const open = inject('open', () => {})
    const selectUser = ref(null)

    const inviteUser = (item, userSelect) => {

      const users = userSelect.map(x => {
        return {
          _id: x._id
        }
      })
      const group = {
        roomId: props.room.roomId
      }

      joinUserGroup({group, users})

      resetAndOpen(item)
    }

    const resetAndOpen = (item) => {
      selectUser.value.clearUserSelect()
      open(item)
    }

    return {
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
