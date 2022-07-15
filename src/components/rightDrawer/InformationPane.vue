<template>
  <v-expand-x-transition>
    <div class="im-right-drawer" v-if="informationPane">
      <v-window v-model="informationPane" class="fill-height">
        <v-window-item value="ROOM_INFO" class="fill-height">
          <room-info />
        </v-window-item>
        <v-window-item value="GROUP_EDIT">
          <group-edit :room="room"/>
        </v-window-item>
        <v-window-item value="GROUP_USER_MANAGE">
          <group-user-manage :room="room"></group-user-manage>
        </v-window-item>
        <v-window-item value="GROUP_HANDOVER_ADMIN">
          <group-handover-admin/>
        </v-window-item>
        <v-window-item value="GROUP_INVITE_USER">
          <group-invite-user :room="room"></group-invite-user>
        </v-window-item>
        <v-window-item value="MESSAGE_HISTORY">
          <message-history :room="room"/>
        </v-window-item>
      </v-window>
    </div>
  </v-expand-x-transition>
</template>

<script>
import {computed} from "@vue/composition-api";
import RoomInfo from "@/components/rightDrawer/RoomInfo";
import GroupEdit from "@/components/rightDrawer/GroupEdit";
import GroupUserManage from "@/components/rightDrawer/GroupUserManage";
import GroupHandoverAdmin from "@/components/rightDrawer/GroupHandoverAdmin";
import GroupInviteUser from "@/components/rightDrawer/GroupInviteUser";
import MessageHistory from "@/components/rightDrawer/MessageHistory";
import store from "@/store";

export default {
  name: "InformationPane",
  components: {MessageHistory, GroupInviteUser, GroupHandoverAdmin, GroupUserManage, GroupEdit, RoomInfo},
  setup() {

    const room = computed(() => store.getters.curRoom)
    const informationPane = computed(() => store.state.informationPane)

    const roomInfo = () => {
      if (informationPane.value) {
        store.commit('setInformationPane', '')
        return
      }
      store.commit('setInformationPane', 'ROOM_INFO')
    }

    return {
      roomInfo,
      informationPane,
      room,
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
