<template>
  <v-expand-x-transition>
    <div class="im-right-drawer" v-if="visible">
      <v-window v-model="activeSub" class="fill-height">
        <v-window-item value="GROUP_INFO">
          <group-info
              :room="room"
              @close="goTo"
          />
        </v-window-item>
        <v-window-item value="GROUP_EDIT">
          <group-edit :room="room" @close="goTo"/>
        </v-window-item>
        <v-window-item value="GROUP_USER_MANAGE">
          <group-user-manage :room="room" @close="goTo"></group-user-manage>
        </v-window-item>
        <v-window-item value="GROUP_HANDOVER_ADMIN">
          <group-handover-admin :room="room" @close="goTo"></group-handover-admin>
        </v-window-item>
        <v-window-item value="GROUP_INVITE_USER">
          <group-invite-user :room="room" @close="goTo"></group-invite-user>
        </v-window-item>
        <v-window-item value="USER_INFO">
          <user-info :room="room" @close="goTo"></user-info>
        </v-window-item>
        <v-window-item value="MESSAGE_HISTORY">
          <message-history :room="room" @close="goTo"></message-history>
        </v-window-item>
      </v-window>
    </div>
  </v-expand-x-transition>
</template>

<script>
import {ref, watch} from "@vue/composition-api";
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
    active: {type: String, default: ''},
    visible: {type: Boolean},
    room: {type: Object},
  },
  setup(props, {emit}) {

    const activeSub = ref('')

    watch(() => props.room, room => {
      console.log('change', room)
      activeSub.value = room.isFriend || room.isSystem ? 'USER_INFO' : 'GROUP_INFO'
    })

    watch(() => props.active, active => {
      console.log(active, 'chan')
      if(active){
        activeSub.value = active
      }else{
        activeSub.value = props.room.isFriend || props.room.isSystem ? 'USER_INFO' : 'GROUP_INFO'
      }
    })

    const goTo = (item) => {
      console.log('rightClose')
      if (!item) {
        close()
        activeSub.value = props.room.isFriend || props.room.isSystem ? 'USER_INFO' : 'GROUP_INFO'
        return
      }
      activeSub.value = item
    }

    const close = () => {
      emit('close')
    }

    return {
      goTo,
      close,
      activeSub,
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
