<template>
  <div>
    <div class="d-flex">
      <div class="mr-2">
        <v-btn icon>
          <v-icon>{{ icons.mdiFolderOutline }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2" @click="inviteUser" v-if="!clickRoom.isFriend">
        <v-btn icon>
          <v-icon>{{ icons.mdiAccountPlusOutline }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2">
        <v-btn icon>
          <v-icon>{{ icons.mdiAlarm }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2">
        <v-btn icon @click="roomInfo">
          <v-icon>{{ icons.mdiDotsHorizontal }}</v-icon>
        </v-btn>
      </div>
    </div>

    <user-info
        :visible="userInfoVisible"
        :room="clickRoom"
        @close="userInfoVisible = false"
    ></user-info>

    <group-info
        :visible="groupInfoVisible"
        :room="clickRoom"
        @chat="createChat"
        @close="groupInfoVisible = false"
    >
    </group-info>

    <invite-user
        :users="systemUsers"
        :visible="inviteUserVisible"
        :room="clickRoom"
        @close="inviteUserVisible = false"
    >

    </invite-user>
  </div>
</template>

<script>
import {
  mdiAccount,
  mdiAccountPlusOutline, mdiAlarm, mdiBookOpenOutline,
  mdiDotsHorizontal,
  mdiFolderOutline,
  mdiMessageBookmark, mdiTextSearch
} from "@mdi/js";
import {onMounted, ref, watch} from "@vue/composition-api";
import GroupInfo from "@/components/drawer/GroupInfo";
import UserInfo from "@/components/drawer/UserInfo";
import InviteUser from "@/components/drawer/InviteUser";
import {createGroup, getUserList} from "@/net/message";

export default {
  name: "RoomOptions",
  props: {
    roomId: String,
    loadedRooms: Array,
    systemUsers: Array,
  },
  components: {
    InviteUser,
    GroupInfo,
    UserInfo,
  },
  setup(props,context) {
    watch(() => props.roomId, (roomId) => {
      console.log("房间ID发生变化")
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
      console.log(clickRoom.value)
    }

    const createChat = item => {
      groupInfoVisible.value = !groupInfoVisible.value
      const roomIndex = props.loadedRooms.findIndex(r => item._id === r.friendId)
      if (roomIndex === -1) {
        createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
        return
      }
      console.log("find ROom")
      context.emit('up-room', props.loadedRooms[roomIndex].roomId)
      context.emit('change-room', props.loadedRooms[roomIndex].roomId)
    }

    const inviteUser = () => {
      getUserList()
      inviteUserVisible.value = true
    }

    return {
      userInfoVisible,
      groupInfoVisible,
      inviteUserVisible,
      clickRoom,
      roomInfo,
      inviteUser,
      createChat,
      icons: {
        mdiTextSearch,
        mdiAccount,
        mdiAccountPlusOutline,
        mdiFolderOutline,
        mdiMessageBookmark,
        mdiDotsHorizontal,
        mdiBookOpenOutline,
        mdiAlarm,
      }
    }
  }
}
</script>

<style scoped>

</style>
