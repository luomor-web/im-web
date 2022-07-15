<template>
  <div>
    <div class="d-flex">
      <div class="mr-2">
        <v-btn icon @click="call('AUDIO')">
          <v-icon>{{ icons.mdiPhone }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2">
        <v-btn icon @click="call('VIDEO')">
          <v-icon>{{ icons.mdiVideoOutline }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2" v-show="!room.isSystem">
        <v-btn icon @click="openRightDrawer('MESSAGE_HISTORY')">
          <v-icon>{{ icons.mdiMagnify }}</v-icon>
        </v-btn>
      </div>
    </div>

    <im-video-dialog ref="videoDialog" :room="room"></im-video-dialog>

  </div>
</template>

<script>
import {mdiDotsVertical, mdiMagnify, mdiPhone, mdiVideoOutline,} from "@mdi/js";
import {computed, inject, ref} from "@vue/composition-api";
import {getUserList} from "@/net/send-message";
import ImVideoDialog from "@/components/system/ImVideoDialog";
import store from "@/store";

export default {
  name: "RoomOptions",
  components: {ImVideoDialog},
  setup() {

    const room = computed(() => store.getters.curRoom)
    // 当前点击的用户,有可能时房间,有可能时用户
    const clickRoom = ref({})

    const videoDialog = ref(null)

    const openRightDrawer = inject('openRightDrawer', () => {
    })

    const inviteUser = () => {
      getUserList()
    }

    const call = (type) => {
      videoDialog.value.call(type)
    }

    return {
      room,
      clickRoom,
      videoDialog,
      openRightDrawer,

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
