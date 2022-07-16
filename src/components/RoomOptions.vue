<template>
  <div>
    <div class="d-flex">
      <div class="mr-2">
        <v-btn icon @click="call('AUDIO')" v-show="!room.isSystem">
          <v-icon>{{ icons.mdiPhone }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2">
        <v-btn icon @click="call('VIDEO')" v-show="!room.isSystem">
          <v-icon>{{ icons.mdiVideoOutline }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2" v-show="!room.isSystem">
        <v-btn icon @click="openInformationPane('MESSAGE_HISTORY')">
          <v-icon>{{ icons.mdiMagnify }}</v-icon>
        </v-btn>
      </div>
    </div>

    <im-video-dialog ref="videoDialog" :room="room"></im-video-dialog>

  </div>
</template>

<script>
import {mdiDotsVertical, mdiMagnify, mdiPhone, mdiVideoOutline,} from "@mdi/js";
import {computed, ref} from "@vue/composition-api";
import {getUserList} from "@/net/send-message";
import ImVideoDialog from "@/components/basic/ImVideoDialog";
import store from "@/store";

export default {
  name: "RoomOptions",
  components: {ImVideoDialog},
  setup() {

    const room = computed(() => store.getters.curRoom)

    const videoDialog = ref(null)

    const inviteUser = () => {
      getUserList()
    }

    const call = (type) => {
      videoDialog.value.call(type)
    }

    const openInformationPane = (item) => {
      store.commit('setInformationPane', item)
    }

    return {
      room,
      videoDialog,
      openInformationPane,

      call,
      inviteUser,

      icons: {
        mdiMagnify,
        mdiDotsVertical,
        mdiVideoOutline,
        mdiPhone,
      }
    }
  }
}
</script>

<style scoped>

</style>
