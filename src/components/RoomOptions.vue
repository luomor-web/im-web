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
  </div>
</template>

<script>
import {mdiDotsVertical, mdiMagnify, mdiPhone, mdiVideoOutline,} from "@mdi/js";
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

    const call = (type) => {
      emit('call', room.value.roomId,type)
    }


    return {
      room,
      clickRoom,

      roomInfo,
      inviteUser,
      openRightDrawer,
      call,

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
