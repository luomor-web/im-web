<template>
  <v-expand-x-transition>
    <div class="im-right-drawer" v-if="informationPane">
      <v-window v-model="informationPane" class="fill-height">
        <v-window-item value="GROUP_INFO" class="fill-height">
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
          <message-history :room="room"/>
        </v-window-item>
      </v-window>
    </div>
  </v-expand-x-transition>
</template>

<script>
import {ref, provide, computed, watch} from "@vue/composition-api";
import GroupInfo from "@/components/rightDrawer/GroupInfo";
import GroupEdit from "@/components/rightDrawer/GroupEdit";
import GroupUserManage from "@/components/rightDrawer/GroupUserManage";
import GroupHandoverAdmin from "@/components/rightDrawer/GroupHandoverAdmin";
import GroupInviteUser from "@/components/rightDrawer/GroupInviteUser";
import UserInfo from "@/components/rightDrawer/UserInfo";
import MessageHistory from "@/components/rightDrawer/MessageHistory";
import store from "@/store";

export default {
  name: "RightDrawer",
  components: {MessageHistory, UserInfo, GroupInviteUser, GroupHandoverAdmin, GroupUserManage, GroupEdit, GroupInfo},
  setup() {

    const room = computed(() => store.getters.curRoom)
    const informationPane = computed(() => store.state.informationPane)
    const visible = ref(false)

    watch(room, room => {
      if(informationPane.value)
        store.commit('setInformationPane', room.value?.isFriend || room.value?.isSystem ? 'USER_INFO' : 'GROUP_INFO')
    })

    const roomInfo = () => {
      if (informationPane.value) {
        store.commit('setInformationPane', '')
        return
      }
      store.commit('setInformationPane', room.value?.isFriend || room.value?.isSystem ? 'USER_INFO' : 'GROUP_INFO')
      // open(room.value.isFriend || room.value.isSystem ? 'USER_INFO' : 'GROUP_INFO')
    }

    const open = () => {
      visible.value = true
    }

    provide('open', open)

    const close = () => {
      visible.value = false
    }

    provide('close', close)

    return {
      informationPane,
      open,
      close,
      roomInfo,
      room,
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
  background-color: #ffffff;
}

</style>
