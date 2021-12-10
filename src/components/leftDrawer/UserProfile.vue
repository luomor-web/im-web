<template>
  <div>
    <drawer-top :title="'编辑资料'" @close="close"></drawer-top>
    <div class="pt-2">
      <div class="mx-2">
        <div class="d-table ma-auto">
          <input type="file" ref="file" class="d-none" accept="image/*" @change="onFileChange($event.target.files)">
          <v-hover >
            <template v-slot:default="{ hover }">
              <v-img
                  aspect-ratio="1"
                  height="120"
                  width="120"
                  class="header-img"
                  :src="curUser.avatar"
              >
                <v-fade-transition>
                  <v-overlay
                      v-if="hover"
                      absolute
                  >
                    <v-btn icon @click="openUpload" height="120" width="120">
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
              v-model="username"
              label="用户名称"
              hide-details="auto"
              outlined
          >
          </v-text-field>
        </div>
      </div>
    </div>
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
import {mdiCamera} from "@mdi/js";
import {ref} from "@vue/composition-api";
import ImCropper from "@/components/system/ImCropper";
import {editProfile} from "@/net/message";
import DrawerTop from "@/components/drawer/DrawerTop";
import {curUser} from "@/views/home/home";

export default {
  name: "UserProfile",
  components: {
    DrawerTop,
    ImCropper
  },
  props: {
    user: Object
  },
  setup(props, context) {
    const file = ref(null)
    const username = ref(curUser.value.username)
    const dialog = ref(false)
    const img = ref('')
    const drawerTemporary = ref(true)

    const onFileChange = (files) => {
      drawerTemporary.value = false
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

    const openUpload = () => {
      file.value.click()
    }

    const close = () => {
      context.emit('close','')
    }

    return {
      file,
      username,
      curUser,
      dialog,
      img,
      drawerTemporary,
      close,
      onFileChange,
      sure,
      changeUserProfile,
      openUpload,
      closeDialog,

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
