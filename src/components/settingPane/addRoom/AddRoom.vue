<template>
  <div>
    <drawer-top  @close="close" :title="'创建群组'">
      <template #right>
        <v-spacer/>
        <v-btn color="primary" :disabled="roomName === ''" @click="createRoom">
          确定
        </v-btn>
      </template>
    </drawer-top>
    <div class="d-table ma-auto">
      <v-hover>
        <template v-slot:default="{ hover }">
          <v-img
            aspect-ratio="1"
            height="120"
            width="120"
            class="header-img"
            :src="roomAvatar ? roomAvatar :require('@/assets/images/default/account-group.svg')"
          >
            <v-fade-transition>
              <v-overlay
                v-if="hover"
                absolute
              >
                <v-btn icon @click="openUpload" height="150" width="150">
                  <v-icon>{{ icons.mdiCamera }}</v-icon>
                </v-btn>
              </v-overlay>
            </v-fade-transition>
          </v-img>
        </template>
      </v-hover>
    </div>
    <div class="mx-2 mb-2 mt-8">
      <v-text-field
        v-model="roomName"
        label="群组名称"
        hide-details="auto"
        outlined
      />
    </div>
    <im-driver/>
    <v-toolbar elevation="0" dense class="mx-2">
      <v-toolbar-title class="subtitle-1 font-weight-black">成员</v-toolbar-title>
      <v-spacer />
      <v-btn icon>
        <v-icon @click="startChoseUser">mdi-plus</v-icon>
      </v-btn>
    </v-toolbar>
    <div class="ma-2">
      <v-chip v-for="(item,index) of userSelect" :key="index" @click="removeUser(item)" class="ma-1">
        {{ item.username }}
        <v-avatar right>
          <v-img :src="item.avatar"/>
        </v-avatar>
      </v-chip>
    </div>
    <im-user-select-dialog :model="addUser" @cancel="closeChoseUser" @sure="sureChoseUser" :users="userSelect" multiple />
    <im-upload ref="upload" @sure="sure"/>
<!--    <v-window v-model="active">-->
<!--      <v-window-item value="GROUP_SETTING">-->
<!--        <add-room-group-info-->
<!--            @close="closeAddRoom"-->
<!--            :user-select="userSelect"-->
<!--        />-->
<!--      </v-window-item>-->
<!--    </v-window>-->
  </div>
</template>

<script>
import store from "@/store";
import {ref} from "@vue/composition-api";
import {createGroup} from "@/net/send-message";
import DrawerTop from "@/components/basic/DrawerTop";
import ImUpload from "@/components/basic/ImUpload";
import ImDriver from "@/components/basic/ImDriver";
import {mdiCamera} from "@mdi/js";
import ImUserSelectDialog from "@/components/basic/ImUserSelectDialog";

export default {
  name: "AddRoom",
  components: {
    ImUserSelectDialog,
    DrawerTop,
    ImUpload,
    ImDriver
  },
  setup() {
    const roomName = ref('')
    const userSelect = ref([])
    const roomAvatar = ref('')
    const upload = ref(null)
    const addUser = ref(false)

    const createRoom = () => {
      const users = userSelect.value.map(x => {
        return { _id: x._id }
      })
      createGroup({isFriend: false, roomName: roomName.value, avatar: roomAvatar.value, users: users})
      closeAddRoom()
    }

    const closeAddRoom = () => {
      userSelect.value = []
      roomName.value = ''
      roomAvatar.value = ''
      store.commit('setSettingPane', '')
    }


    const closeChoseUser = () => {
      addUser.value = false
    }

    const sureChoseUser = (data) => {
      const {users} = data
      userSelect.value = [...users]
      addUser.value = false
    }

    const removeUser = (item) => {
      const index = userSelect.value.findIndex(r => r._id === item._id);
      if (index !== -1) {
        userSelect.value.splice(index, 1)
      }
    }

    const startChoseUser = () => {
      addUser.value = true
    }

    const openUpload = () => {
      upload.value.startUpload()
    }

    const sure = url => {
      roomAvatar.value = url
    }

    return {
      addUser,
      upload,
      roomName,
      roomAvatar,
      userSelect,
      sure,
      removeUser,
      sureChoseUser,
      openUpload,
      createRoom,
      closeChoseUser,
      closeAddRoom,
      startChoseUser,

      icons: {
        mdiCamera
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/theme";

.header-img {
  border-radius: 120px;
  background-color: $v-grey-lighten1;
}
</style>
