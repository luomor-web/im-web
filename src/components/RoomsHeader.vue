<template>
  <div>
    <div class="room-header-container">
      <v-btn
          icon
          x-large
          @click="editUserProfile"
      >
        <v-avatar color="#b7c1ca">
          <img
              :src="curUser.avatar"
              :alt="curUser.username"
          >
        </v-avatar>
      </v-btn>
      <h3 class="ml-3">
        {{ curUser.username }}
      </h3>
      <v-spacer></v-spacer>
      <v-menu bottom left offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon
                 v-bind="attrs"
                 v-on="on"
          >
            <v-icon>
              {{ icons.mdiChevronDown }}
            </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center pl-3 pr-3">
              <v-btn
                  depressed
                  rounded
                  text
                  @click="addRoom"
              >
                创建群组
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn
                  depressed
                  rounded
                  text
                  @click="addChat"
              >
                添加会话
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn
                  depressed
                  rounded
                  text
                  @click="quit"
              >
                退出
              </v-btn>
            </div>
          </v-list-item-content>
        </v-card>
      </v-menu>
    </div>
    <add-chat
        :users="systemUsers"
        :visible="chatAddVisible"
        @chat="createChat"
        @close="chatAddVisible = false"
    ></add-chat>

    <add-room
        :visible="roomAddVisible"
        @close="roomAddVisible = false"
    ></add-room>

    <user-profile
        :user="curUser"
        :visible="userProfileVisible"
        @close="userProfileVisible = false"
    ></user-profile>

  </div>
</template>

<script>
import {ref} from "@vue/composition-api";
import {mdiChevronDown} from "@mdi/js";
import UserProfile from "@/components/drawer/UserProfile";
import AddChat from "@/components/drawer/AddChat";
import AddRoom from "@/components/drawer/AddRoom";
import {createGroup, getUserList, quitSystem} from "@/net/message";

export default {
  name: "RoomsHeader",
  props: {
    curUser: Object,
    systemUsers: Array,
    loadedRooms: Array,
  },
  components: {
    UserProfile,
    AddChat,
    AddRoom,
  },
  setup(props, context) {
    // 用户信息是否展示
    const userProfileVisible = ref(false)
    // 新建房间是否展示
    const roomAddVisible = ref(false)
    // 新建chat组件是否可见
    const chatAddVisible = ref(false)

    const editUserProfile = () => {
      userProfileVisible.value = true
    }

    const addRoom = () => {
      roomAddVisible.value = !roomAddVisible.value
    }

    const addChat = () => {
      chatAddVisible.value = !chatAddVisible.value
      getUserList()
    }

    const quit = () => {
      quitSystem()
    }

    const createChat = item => {
      chatAddVisible.value = !chatAddVisible.value
      const roomIndex = props.loadedRooms.findIndex(r => item._id === r.friendId)
      if (roomIndex === -1) {
        createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
        return
      }
      context.emit('up-room', props.loadedRooms[roomIndex].roomId)
      context.emit('change-room', props.loadedRooms[roomIndex].roomId)
    }

    return {

      userProfileVisible,
      chatAddVisible,
      roomAddVisible,
      editUserProfile,
      addRoom,
      createChat,
      addChat,

      quit,
      icons: {
        mdiChevronDown
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.room-header-container {
  position: sticky;
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 15px;
}
</style>
