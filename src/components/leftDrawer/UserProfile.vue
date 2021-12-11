<template>
  <div>
    <drawer-top :title="'编辑资料'" @close="close"></drawer-top>
    <div class="pt-2">
      <div class="mx-2">
        <div class="d-table ma-auto">
          <input type="file" ref="file" class="d-none" accept="image/*" @change="onFileChange($event.target.files)">
          <v-hover>
            <template v-slot:default="{ hover }">
              <v-img
                  aspect-ratio="1"
                  height="120"
                  width="120"
                  class="header-img"
                  :src="user.avatar"
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
              label="昵称"
              hide-details="auto"
              outlined
          >
          </v-text-field>
        </div>
      </div>
      <v-fab-transition>
        <v-btn
            class="mb-16 mr-8"
            v-show="showSure"
            absolute
            fab
            right
            bottom
            color="success"
            @click="changeUserProfile(null)"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </v-fab-transition>
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
import {computed, onMounted, ref, watch} from "@vue/composition-api";
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
    watch(() => props.user, () => {
      // username.value = user.username
      initData()
    })

    // 当前是否可以确认

    const showSure = computed(() => {
      return username.value !== props.user.username && username.value !== ''
    })

    const file = ref(null)
    const username = ref('')
    const dialog = ref(false)
    const img = ref('')

    const initData = () => {
      username.value = props.user.username
    }

    onMounted(() => {
    })

    const onFileChange = (files) => {
      dialog.value = true
      img.value = URL.createObjectURL(files[0])
    }

    const changeUserProfile = (url) => {
      editProfile({roomId: curUser.value._id, isGroup: false, avatar: url, name: username.value})
    }

    const closeDialog = () => {
      dialog.value = false
      img.value = ''
    }

    const sure = (url) => {
      dialog.value = false
      changeUserProfile(url)
    }

    const openUpload = () => {
      file.value.click()
    }

    const close = item => {
      initData()
      context.emit('close', item)
    }

    return {
      file,
      username,
      dialog,
      img,
      showSure,
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
