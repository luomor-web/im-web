<template>
  <div>
    <im-drawer title="用户信息" @close="closeUserProfile" :visible="visible" :temporary="drawerTemporary">
      <template #content="{}">
        <div class="d-table ma-auto">
          <v-hover>
            <template v-slot:default="{ hover }">
              <v-img
                  aspect-ratio="1"
                  height="150"
                  width="150"
                  class="header-img"
                  :src="curUser.avatar"
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
          <v-text-field v-model="username"
                        small
                        light
                        label="用户名称"
                        single-line>
          </v-text-field>
          <v-spacer></v-spacer>
          <v-btn color="primary" :disabled="curUser.username === username || username === ''"
                 @click="changeUserProfile(null)">
            确认
          </v-btn>
        </div>
      </template>
    </im-drawer>
    <v-dialog
        hide-overlay
        persistent
        v-model="dialog"
        width="500"
    >
      <im-cropper :img="img" @sure="sure" @center="closeDialog"></im-cropper>
    </v-dialog>
  </div>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {mdiCamera} from "@mdi/js";
import {ref, watch} from "@vue/composition-api";
import ImCropper from "@/components/system/ImCropper";
import {editProfile} from "@/net/message";

export default {
  name: "UserProfile",
  components: {
    ImDrawer,
    ImCropper
  },
  props: {
    visible: Boolean,
    user: Object
  },
  setup(props, context) {
    const file = ref(null)
    const curUser = ref(props.user)
    const username = ref(curUser.value.username)
    const dialog = ref(false)
    const img = ref('')
    const drawerTemporary = ref(true)

    watch(() => props.visible, (visible) => {
      if (visible) {
        curUser.value = {...props.user}
        username.value = curUser.value.username
      }
    })

    watch(() => props.user, () => {
      curUser.value = {...props.user}
    })

    const onFileChange = (files) => {
      drawerTemporary.value = false
      console.log(files)
      dialog.value = true

      img.value = URL.createObjectURL(files[0])
    }

    const changeUserProfile = (url) => {
      editProfile({roomId: curUser.value._id, isGroup: false, avatar: url, name: username.value})
    }

    const closeDialog = () => {
      drawerTemporary.value = true
      dialog.value = false
      img.value = ''
    }

    const sure = (url) => {
      drawerTemporary.value = true
      dialog.value = false
      changeUserProfile(url)
    }

    const closeUserProfile = () => {
      context.emit('close')
    }
    const openUpload = () => {
      console.log(file.value)
      file.value.click()
      console.log('upload pic ')
    }

    return {
      file,
      username,
      curUser,
      dialog,
      img,
      drawerTemporary,
      onFileChange,
      sure,
      changeUserProfile,
      openUpload,
      closeUserProfile,
      closeDialog,

      icons: {
        mdiCamera
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@import "../../styles/theme";

.header-img {
  border-radius: 150px;
  background-color: $v-grey-lighten1;
}


</style>
