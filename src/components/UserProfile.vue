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
          <v-btn color="primary" :disabled="curUser.username === username || username === ''" @click="changeUserProfile(null)">
            确认
          </v-btn>
        </div>
      </template>
    </im-drawer>
    <v-dialog
        persistent
        v-model="dialog"
        width="500"
    >
      <v-card>
        <v-card-title class="text-h5">
          Use Google's location service?
        </v-card-title>
        <v-card-text>
          <cropper class="cropper"
                   ref="cropper"
                   :src="img"
                   :stencilProps="{aspectRatio: 1}"
                   @change="cropperFile"></cropper>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              @click="dialog = false"
          >
            取消
          </v-btn>
          <v-btn
              color="primary"
              @click="sure"
          >
            确定
          </v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>
  </div>
</template>

<script>
import ImDrawer from "@/components/ImDrawer";
import {mdiCamera} from "@mdi/js";
import {ref, watch} from "@vue/composition-api";
import {Cropper} from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.compact.css';
import {addFiles} from "@/utils/file";
import {editProfile} from "@/net/message";

export default {
  name: "UserProfile",
  components: {
    ImDrawer,
    Cropper
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
    const cropper = ref(null)

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

    const sure = () => {
      drawerTemporary.value = true
      const {canvas} = cropper.value.getResult();
      if (canvas) {
        canvas.toBlob(blob => {
          const file = {
            blob: blob,
            name: 'header',
            size: blob.size,
            type: 'image/jpeg',
            extension: 'jpeg',
          }
          console.log(file, 'wait upload')
          addFiles([file], '', (file, over) => {
            console.log(file, over)
            if (over) {
              dialog.value = false
              changeUserProfile(file.url)
            }
          })
        }, 'image/jpeg')
      }
      console.log(canvas, 'canvas')
    }

    const cropperFile = ({coordinates, canvas}) => {
      console.log({coordinates, canvas})
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
      cropper,
      onFileChange,
      drawerTemporary,
      sure,
      changeUserProfile,
      openUpload,
      closeUserProfile,
      cropperFile,

      icons: {
        mdiCamera
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@import "../styles/theme.scss";

.header-img {
  border-radius: 150px;
  background-color: $v-grey-lighten1;
}

.cropper {
  height: 300px;
  background: #DDD;
}
</style>
