<template>
  <v-expand-x-transition>
    <div class="im-right-drawer" v-if="visible">
      <v-window v-model="activeSub" style="height: 100% ">
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

export default {
  name: "RightDrawer",
  components: {GroupInviteUser, GroupHandoverAdmin, GroupUserManage, GroupEdit, GroupInfo},
  props: {
    active: {type: String, default: 'GROUP_INFO'},
    visible: {type: Boolean},
    room: {type: Object},
  },
  setup(props, {emit}) {

    const activeSub = ref('GROUP_INFO')

    watch(() => props.active, active => {
      activeSub.value = active
    })

    const goTo = (item) => {
      if (!item) close()
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
  height: 100%;
  background-color: #ffffff;
}

</style>
