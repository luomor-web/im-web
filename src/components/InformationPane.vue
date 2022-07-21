<template>
  <v-expand-x-transition>
    <div v-if="informationPane" class="im-right-drawer">
      <v-window v-model="informationPane" class="fill-height">
        <v-window-item value="ROOM_INFO">
          <room-info />
        </v-window-item>
        <v-window-item value="GROUP_EDIT">
          <group-edit />
        </v-window-item>
        <v-window-item value="GROUP_USER_MANAGE">
          <group-user-manage />
        </v-window-item>
        <v-window-item value="GROUP_HANDOVER_ADMIN">
          <group-handover-admin />
        </v-window-item>
        <v-window-item value="MESSAGE_HISTORY">
          <message-history />
        </v-window-item>
      </v-window>
    </div>
  </v-expand-x-transition>
</template>

<script>
import { computed, watch } from '@vue/composition-api'
import RoomInfo from '@/components/informationPane/RoomInfo'
import GroupEdit from '@/components/informationPane/GroupEdit'
import GroupUserManage from '@/components/informationPane/GroupUserManage'
import GroupHandoverAdmin from '@/components/informationPane/GroupHandoverAdmin'
import MessageHistory from '@/components/informationPane/MessageHistory'
import store from '@/store'

export default {
  name: 'InformationPane',
  components: { MessageHistory, GroupHandoverAdmin, GroupUserManage, GroupEdit, RoomInfo },
  setup() {
    const room = computed(() => store.getters.curRoom)
    const informationPane = computed(() => store.state.informationPane)

    watch(room, () => {
      if (informationPane.value) {
        store.commit('setInformationPane', 'ROOM_INFO')
      }
    })

    return {
      informationPane,
      room
    }
  }
}
</script>

<style lang="scss" scoped>

.im-right-drawer {
  position: relative;
  width: 400px;
  background-color: #ffffff;
}

.v-window-item {
  height: inherit;
}

</style>
