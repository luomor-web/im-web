<template>
  <div>
    <div class="d-flex">
      <div class="mr-2">
        <v-btn icon @click="openRightDrawer('MESSAGE_HISTORY')">
          <v-icon>{{ icons.mdiMagnify }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2">
        <v-btn icon @click="roomInfo">
          <v-icon>{{ icons.mdiDotsVertical  }}</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import {mdiDotsVertical, mdiMagnify,} from "@mdi/js";
import {ref} from "@vue/composition-api";
import {getUserList} from "@/net/message";

export default {
  name: "RoomOptions",
  props: {
    roomId: String,
  },
  components: {
  },
  setup(props, {emit}) {

    // 当前点击的用户,有可能时房间,有可能时用户
    const clickRoom = ref({})

    const roomInfo = () => {
      if (clickRoom.value.isFriend) {
        return
      }
    }

    // const createChat = item => {
      // const roomIndex = props.loadedRooms.findIndex(r => item._id === r.friendId)
      // if (roomIndex === -1) {
      //   createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
      //   return
      // }
      // emit('up-room', props.loadedRooms[roomIndex].roomId)
      // emit('change-room', props.loadedRooms[roomIndex].roomId)
    // }

    const inviteUser = () => {
      getUserList()
    }

    const openRightDrawer = item => {
      emit('open',item)
    }

    const openFileHistory = () => {
    }

    return {
      clickRoom,
      roomInfo,
      inviteUser,
      openRightDrawer,
      openFileHistory,
      icons: {
        mdiMagnify ,
        mdiDotsVertical ,
      }
    }
  }
}
</script>

<style scoped>

</style>
