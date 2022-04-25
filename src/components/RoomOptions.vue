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
      <div class="mr-2">
        <v-btn icon @click="roomInfo">
          <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
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
import {loadedRooms} from "@/views/home/home";
import ImVideoDialog from "@/components/system/ImVideoDialog";

export default {
  name: "RoomOptions",
  props: {
    roomId: String,
  },
  components: {ImVideoDialog},
  setup(props) {

    // 当前点击的用户,有可能时房间,有可能时用户
    const clickRoom = ref({})

    const videoDialog = ref(null)

    const openRightDrawer = inject('openRightDrawer', () => {
    })

    const room = computed(() => {
      return loadedRooms.value.find(r => r.roomId === props.roomId);
    })

    const roomInfo = () => {
      if (clickRoom.value.isFriend) {
        return
      }
    }

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
      roomInfo,
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
