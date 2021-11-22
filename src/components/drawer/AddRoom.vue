<template>
  <div>
    <im-drawer title="创建群组" @close="closeAddRoom" :visible="visible" :temporary="drawerTemporary">
      <template #content="{}">
        <div class="d-table ma-auto">
          <v-hover>
            <template v-slot:default="{ hover }">
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
        <user-select v-if="visible" :height="errorVisible ? 392 : 332" @operationUser="operationUser"></user-select>
      </template>
    </im-drawer>
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
import {mdiArrowRight, mdiTicketAccount, mdiCamera} from "@mdi/js";
import {ref} from "@vue/composition-api";
import ImDrawer from "@/components/drawer/ImDrawer";
import {createGroup} from "@/net/message";
import ImCropper from "@/components/system/ImCropper";
import UserSelect from "@/components/user/UserSelect";

export default {
  name: "AddRoom",
  components: {UserSelect, ImDrawer, ImCropper},
  props: {
    visible: Boolean
  },
  setup(props, context) {
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
      context.emit('close')
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

    const openUpload = () => {
      file.value.click()
    }

    const operationUser = items => {
      userSelect.value = [...items]
    }

    return {
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
        mdiCamera
      },

    }
  }
}
</script>

<style lang="scss" scoped>

@import "../../styles/theme";

.no-drag {
  -webkit-app-region: no-drag;
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
