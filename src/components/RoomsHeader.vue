<template>
  <div>
    <div class="room-header-container">
      <v-menu
          bottom
          min-width="260px"
          :rounded="'lg'"
          offset-y
      >
        <template v-slot:activator="{ on }">
          <v-btn
              v-on="on"
              icon
              x-large
          >
            <v-avatar color="#b7c1ca">
              <img
                  :src="curUser.avatar"
                  :alt="curUser.username"
              >
            </v-avatar>
          </v-btn>
        </template>
        <v-card flat
                class="mt-2">
          <v-list>
            <v-list-item class="im-list-item" @click="goTo('USER_PROFILE')">
              <v-list-item-icon>
                <v-icon>{{ icons.mdiPencilOutline }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                编辑资料
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="im-list-item">
              <v-list-item-icon>
                <v-icon>{{ icons.mdiCog }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                设置
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="im-list-item" @click="quit">
              <v-list-item-icon>
                <v-icon>{{ icons.mdiExitToApp }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                退出
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

      </v-menu>

      <h3 class="ml-3">
        {{ curUser.username }}
      </h3>
      <v-spacer></v-spacer>
    </div>
  </div>
</template>

<script>
import {ref} from "@vue/composition-api";
import {mdiAccountOutline, mdiChevronDown, mdiCog, mdiExitToApp, mdiPencilOutline} from "@mdi/js";
import {createGroup, getUserList, quitSystem} from "@/net/message";

export default {
  name: "RoomsHeader",
  props: {
    curUser: Object,
    systemUsers: Array,
    loadedRooms: Array,
  },
  components: {},
  setup(props, context) {
    // 用户信息是否展示
    const userProfileVisible = ref(false)
    // 新建房间是否展示
    const roomAddVisible = ref(false)
    // 新建chat组件是否可见
    const chatAddVisible = ref(false)

    const goTo = item => {
      context.emit('goto', item)
    }

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
      goTo,

      quit,
      icons: {
        mdiPencilOutline,
        mdiAccountOutline,
        mdiChevronDown,
        mdiCog,
        mdiExitToApp
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
