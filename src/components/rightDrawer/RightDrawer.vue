<template>
  <v-expand-x-transition>
    <div class="im-right-drawer" v-if="visible">
      <v-window v-model="active" class="fill-height">
        <v-window-item value="GROUP_INFO">
          <group-info :room="room"/>
        </v-window-item>
        <v-window-item value="GROUP_EDIT">
          <group-edit :room="room"/>
        </v-window-item>
        <v-window-item value="GROUP_USER_MANAGE">
          <group-user-manage :room="room"></group-user-manage>
        </v-window-item>
        <v-window-item value="GROUP_HANDOVER_ADMIN">
          <group-handover-admin :room="room"></group-handover-admin>
        </v-window-item>
        <v-window-item value="GROUP_INVITE_USER">
          <group-invite-user :room="room"></group-invite-user>
        </v-window-item>
        <v-window-item value="USER_INFO">
          <user-info :room="room"></user-info>
        </v-window-item>
        <v-window-item value="MESSAGE_HISTORY">
          <message-history :room="room" />
        </v-window-item>
      </v-window>
    </div>
  </v-expand-x-transition>
</template>

<script>
import {ref, watch, provide} from "@vue/composition-api";
import GroupInfo from "@/components/rightDrawer/GroupInfo";
import GroupEdit from "@/components/rightDrawer/GroupEdit";
import GroupUserManage from "@/components/rightDrawer/GroupUserManage";
import GroupHandoverAdmin from "@/components/rightDrawer/GroupHandoverAdmin";
import GroupInviteUser from "@/components/rightDrawer/GroupInviteUser";
import UserInfo from "@/components/rightDrawer/UserInfo";
import MessageHistory from "@/components/rightDrawer/MessageHistory";

export default {
  name: "RightDrawer",
  components: {MessageHistory, UserInfo, GroupInviteUser, GroupHandoverAdmin, GroupUserManage, GroupEdit, GroupInfo},
  props: {
    room: {type: Object},
  },
  setup(props) {
    const visible = ref(false)
    const active = ref('')

    watch(() => props.room, (room,old) => {
      if (old === undefined) return
      console.log('change', room,old)
      active.value = room.isFriend || room.isSystem ? 'USER_INFO' : 'GROUP_INFO'
    })

    const roomInfo = () => {
      if(visible.value) {
        close()
        return
      }
      open(props.room.isFriend || props.room.isSystem ? 'USER_INFO' : 'GROUP_INFO')
    }

    const open = item => {
      active.value = item
      visible.value = true
    }

    provide('open', open)

    const close = () => {
      active.value = ''
      visible.value = false
    }

    provide('close', close)

    return {
      open,
      close,
      roomInfo,
      active,
      visible,
    }
  }
}
</script>

<style lang="scss" scoped>

@import "src/styles/theme";

.im-right-drawer {
  position: relative;
  width: 400px;
  height: 100vh;
  background-color: #ffffff;
}

</style>
