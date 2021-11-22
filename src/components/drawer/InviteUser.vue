<template>
  <im-drawer title="邀请用户" @close="closeInviteUser" :direction="true" :visible="visible">
    <template #content="{}">
      <user-select v-if="visible"
                   :height="96"
                   :useAlone="true"
                   :filter="room.users"
                   @operationUser="operationUser"
                   @aloneClick="joinGroup">
      </user-select>
    </template>
  </im-drawer>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import UserSelect from "@/components/user/UserSelect";
import {ref} from "@vue/composition-api";
import {mdiArrowRight, mdiCamera, mdiChatOutline, mdiMagnify, mdiTicketAccount} from "@mdi/js";
import {joinUserGroup} from "@/net/message";

export default {
  name: "InviteUser",
  props: {
    room: Object,
    visible: Boolean,
  },
  components: {
    ImDrawer,
    UserSelect
  },
  setup(props, context) {

    const userSelect = ref([])

    const operationUser = items => {
      userSelect.value = [...items]
    }

    const joinGroup = () => {
      const users = userSelect.value.map(x => {
        return {
          _id: x._id
        }
      })
      const group = {
        roomId: props.room.roomId
      }
      joinUserGroup({group, users})
      clearData()
      context.emit('close')
    }

    const clearData = () => {
      userSelect.value = []
    }

    const closeInviteUser = () => {
      context.emit('close')
      clearData()
    }

    return {
      userSelect,
      closeInviteUser,
      operationUser,
      joinGroup,

      icons: {
        mdiArrowRight,
        mdiMagnify,
        mdiChatOutline,
        mdiTicketAccount,
        mdiCamera
      },
    }
  }
}
</script>

<style lang="scss" scoped>

.avatar {
  width: 52px;
}
</style>
