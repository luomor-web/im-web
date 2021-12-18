<template>
  <div>
    <div class="d-flex">
      <div class="mr-2">
        <v-btn icon @click="openMessageHistory">
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
import {onMounted, ref, watch} from "@vue/composition-api";
import {createGroup, getUserList} from "@/net/message";

export default {
  name: "RoomOptions",
  props: {
    roomId: String,
    loadedRooms: Array,
    systemUsers: Array,
  },
  components: {
  },
  setup(props, context) {
    watch(() => props.roomId, (roomId) => {
      const index = props.loadedRooms.findIndex(r => r.roomId === roomId);
      clickRoom.value = {...props.loadedRooms[index]}
    })

    watch(() => props.loadedRooms, (loadedRooms) => {
      const index = loadedRooms.findIndex(r => r.roomId === props.roomId);
      clickRoom.value = {...loadedRooms[index]}
    })

    // 用户信息展示组件
    const userInfoVisible = ref(false)
    // 群组信息展示组件
    const groupInfoVisible = ref(false)
    // 邀请用户展示组件
    const inviteUserVisible = ref(false)
    // 历史消息
    const messageHistoryVisible = ref(false)
    // 历史文件
    const fileHistoryVisible = ref(false)
    // 当前点击的用户,有可能时房间,有可能时用户
    const clickRoom = ref({})

    onMounted(() => {
      const index = props.loadedRooms.findIndex(r => r.roomId === props.roomId);
      clickRoom.value = {...props.loadedRooms[index]}
    })

    const roomInfo = () => {
      if (clickRoom.value.isFriend) {
        userInfoVisible.value = true
        return
      }
      groupInfoVisible.value = true
    }

    const createChat = item => {
      groupInfoVisible.value = !groupInfoVisible.value
      const roomIndex = props.loadedRooms.findIndex(r => item._id === r.friendId)
      if (roomIndex === -1) {
        createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
        return
      }
      context.emit('up-room', props.loadedRooms[roomIndex].roomId)
      context.emit('change-room', props.loadedRooms[roomIndex].roomId)
    }

    const inviteUser = () => {
      getUserList()
      inviteUserVisible.value = true
    }

    const openMessageHistory = () => {
      messageHistoryVisible.value = true
    }

    const openFileHistory = () => {
      fileHistoryVisible.value = true
    }

    return {
      userInfoVisible,
      groupInfoVisible,
      inviteUserVisible,
      fileHistoryVisible,
      clickRoom,
      roomInfo,
      inviteUser,
      createChat,
      openMessageHistory,
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
