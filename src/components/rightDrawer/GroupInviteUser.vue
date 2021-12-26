<template>
  <add-room-select-user
      ref="selectUser"
      :icon="icons.mdiCheck"
      :room="room"
      @to-go="inviteUser('GROUP_INFO',$event)"
      @close="close('GROUP_INFO')"/>
</template>

<script>
import AddRoomSelectUser from "@/components/leftDrawer/addRoom/AddRoomSelectUser";
import {ref} from "@vue/composition-api";
import {mdiCheck} from "@mdi/js";
import {joinUserGroup} from "@/net/message";

export default {
  name: "GroupInviteUser",
  props: {
    room: Object,
  },
  components: {
    AddRoomSelectUser
  },
  setup(props, {emit}) {

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

      close(item)
    }

    const close = (item) => {
      selectUser.value.clearUserSelect()
      emit('close', item)
    }

    return {
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
