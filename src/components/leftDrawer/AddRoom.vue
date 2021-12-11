<template>
  <div>
    <drawer-top :close="closeAddRoom"></drawer-top>
    <div class="d-table ma-auto">
      <v-hover>
        <template v-slot:default="{ hover }">d sx1zx
          <v-img
              aspect-ratio="1"
              height="150"
              width="150"
              class="header-img"
              :src="roomAvatar ? picUrl +roomAvatar :require('@/assets/images/default/account-group.svg')"
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
    <input type="file" ref="file" class="d-none" accept="image/*" @change="onFileChange($event.target.files)">
    <div class="d-flex align-center py-2">

      <v-text-field v-model="roomName"
                    light
                    label="群组名称"
                    single-line
                    :prepend-icon="icons.mdiTicketAccount"
                    :append-icon="roomName ? icons.mdiArrowRight : ''"
                    @click:append="createRoom">
      </v-text-field>

    </div>
    <div>
      <v-alert
          v-model="errorVisible"
          border="left"
          dense
          dismissible
          type="error"
      >需要至少除您之外的两个用户
      </v-alert>
    </div>
    <div>
      <div class="d-flex mb-2 my-3">
        <div>
          <h3>已选择({{ userSelect.length }})人</h3>
        </div>
        <v-spacer></v-spacer>
      </div>
      <div>
        <div class="pb-3 d-flex flex-row flex-wrap">
          <add-user-icon :title="'添加'" @click="userSelectModelOpen"></add-user-icon>
          <template v-for="(item, index) in userSelect">
            <div class="px-2 d-flex flex-column" :key="index">
              <div class="align-center avatar">
                <v-badge
                    :color="item.status.state === 'online' ? 'green':'red'"
                    bordered
                    bottom
                    dot
                    overlap
                >
                  <v-avatar size="36" @click="removeUser(item)">
                    <v-img :src="item.avatar"></v-img>
                  </v-avatar>
                </v-badge>
              </div>
              <span class="subtitle-2 align-self-center text--secondary">
                    {{ item.username.length > 3 ? item.username.substring(0, 3) + '..' : item.username }}
                  </span>
            </div>
          </template>
        </div>
      </div>
      <user-select :visible="userSelectModel"
                   :filter="userSelect"
                   @close="userSelectModelClose"
                   @sure="operationUser"></user-select>
    </div>
    <v-dialog
        hide-overlay
        persistent
        v-model="dialog"
        width="500"
    >
      <im-cropper :img="img" @sure="sure" @cancel="closeDialog"></im-cropper>
    </v-dialog>
  </div>
</template>

<script>
import {mdiArrowRight, mdiCamera, mdiPlus, mdiTicketAccount} from "@mdi/js";
import {ref} from "@vue/composition-api";
import {createGroup} from "@/net/message";
import ImCropper from "@/components/system/ImCropper";
import UserSelect from "@/components/user/UserSelect";
import AddUserIcon from "@/components/user/AddUserIcon";
import DrawerTop from "@/components/drawer/DrawerTop";

export default {
  name: "AddRoom",
  components: {DrawerTop, AddUserIcon, UserSelect, ImCropper},
  props: {
    visible: Boolean
  },
  setup(props, context) {
    const userSelectModel = ref(false)
    const errorVisible = ref(false)
    const userSelect = ref([])
    const roomName = ref('')
    const dialog = ref(false)
    const img = ref('')
    const drawerTemporary = ref(true)
    const cropper = ref(null)
    const file = ref(null)
    const roomAvatar = ref('')
    const picUrl = ref(process.env.VUE_APP_PIC_URL)

    const closeAddRoom = () => {
      clearData()
      context.emit('close','')
    }

    const clearData = () => {
      userSelect.value = []
      errorVisible.value = false
      roomName.value = ''
      roomAvatar.value = ''
    }

    const onFileChange = (files) => {
      drawerTemporary.value = false
      dialog.value = true

      img.value = URL.createObjectURL(files[0])
    }

    const closeDialog = () => {
      drawerTemporary.value = true
      dialog.value = false
      img.value = ''
    }

    const sure = (url) => {
      dialog.value = false
      roomAvatar.value = url
      drawerTemporary.value = true
    }

    const createRoom = () => {
      if (userSelect.value.length <= 1) {
        errorVisible.value = true
        return
      }
      const users = userSelect.value.map(x => {
        return {
          _id: x._id
        }
      })
      createGroup({isFriend: false, roomName: roomName.value, avatar: roomAvatar.value, users: users})
      clearData()
      closeAddRoom()
    }

    const removeUser = (item) => {
      const index = userSelect.value.findIndex(r => r._id === item._id);
      userSelect.value.splice(index, 1)
    }

    const openUpload = () => {
      file.value.click()
    }

    const operationUser = items => {
      userSelect.value = [...userSelect.value, ...items]
      userSelectModel.value = false
      drawerTemporary.value = true
    }

    const userSelectModelOpen = () => {
      drawerTemporary.value = false
      userSelectModel.value = true
    }

    const userSelectModelClose = () => {
      drawerTemporary.value = true
      userSelectModel.value = false
    }

    return {
      userSelectModel,
      img,
      cropper,
      file,
      dialog,
      errorVisible,
      roomName,
      userSelect,
      drawerTemporary,
      roomAvatar,
      picUrl,
      userSelectModelClose,
      userSelectModelOpen,
      removeUser,
      closeDialog,
      sure,
      closeAddRoom,
      createRoom,
      operationUser,
      openUpload,
      onFileChange,
      icons: {
        mdiArrowRight,
        mdiTicketAccount,
        mdiCamera,
        mdiPlus,
      },

    }
  }
}
</script>

<style lang="scss" scoped>

@import "src/styles/theme";

.no-drag {
  -webkit-app-region: no-drag;
}

.avatar {
  width: 52px;
  height: 52px;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.header-img {
  border-radius: 150px;
  background-color: $v-grey-lighten1;
}

.cropper {
  height: 300px;
  background: #DDD;
}

</style>
