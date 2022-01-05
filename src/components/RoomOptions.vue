<template>
  <div>
    <div class="d-flex">
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
  </div>
</template>

<script>
import {mdiDotsVertical, mdiMagnify,} from "@mdi/js";
import {computed, ref} from "@vue/composition-api";
import {getUserList} from "@/net/message";
import {loadedRooms} from "@/views/home/home";

export default {
  name: "RoomOptions",
  props: {
    roomId: String,
  },
  components: {},
  setup(props, {emit}) {

    // 当前点击的用户,有可能时房间,有可能时用户
    const clickRoom = ref({})

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

    const openRightDrawer = item => {
      emit('open', item)
    }

    const openFileHistory = () => {
    }

    return {
      room,
      clickRoom,
      roomInfo,
      inviteUser,
      openRightDrawer,
      openFileHistory,
      icons: {
        mdiMagnify,
        mdiDotsVertical,
      }
    }
  }
}
</script>

<style scoped>

</style>
