<template>
  <div>
    <div class="d-flex">
      <div class="mr-2">
        <v-btn icon>
          <v-icon>{{ icons.mdiFolderOutline }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2" @click="inviteUser">
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
        @close="groupInfoVisible = false"
    >
    </group-info>

    <invite-user
        :users="systemUsers"
        :visible="inviteUserVisible"
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
import {ref, watch} from "@vue/composition-api";
import GroupInfo from "@/components/drawer/GroupInfo";
import UserInfo from "@/components/drawer/UserInfo";
import InviteUser from "@/components/drawer/InviteUser";
import {getUserList} from "@/net/message";

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
  setup(props) {
    watch(() => props.roomId, (roomId) => {
      const index = props.loadedRooms.findIndex(r => r.roomId === roomId);
      clickRoom.value = {...props.loadedRooms[index]}
    })

    // 用户信息展示组件
    const userInfoVisible = ref(false)
    // 群组信息展示组件
    const groupInfoVisible = ref(false)
    // 邀请用户展示组件
    const inviteUserVisible = ref(false)

    // 当前点击的用户,有可能时房间,有可能时用户
    const clickRoom = ref({})

    const roomInfo = () => {
      const index = props.loadedRooms.findIndex(r => r.roomId === props.roomId);
      clickRoom.value = {...props.loadedRooms[index]}
      if (clickRoom.value.isFriend) {
        userInfoVisible.value = true
        return
      }
      groupInfoVisible.value = true
      console.log(clickRoom.value)
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
