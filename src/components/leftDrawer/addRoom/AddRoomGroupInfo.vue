<template>
  <div>
    <drawer-top :sub="true" @close="goTo" :title="'群组资料'">
      <template #right>
        <v-spacer></v-spacer>
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
      >
      </v-text-field>
    </div>
    <im-upload ref="upload" @sure="sure" ></im-upload>
  </div>
</template>

<script>
import {createGroup} from "@/net/send-message";
import {ref} from "@vue/composition-api";
import DrawerTop from "@/components/basic/DrawerTop";
import {mdiCamera, mdiCheck} from "@mdi/js";
import ImUpload from "@/components/basic/ImUpload";

export default {
  name: "AddRoomGroupInfo",
  components: {ImUpload, DrawerTop},
  props: {
    userSelect: {type: Array, default: () => []},
  },
  setup(props, {emit}) {

    const roomName = ref('')
    const roomAvatar = ref('')
    const uploading = ref(false)
    const upload = ref(null)

    const createRoom = () => {

      const users = props.userSelect.map(x => {
        return {
          _id: x._id
        }
      })
      createGroup({isFriend: false, roomName: roomName.value, avatar: roomAvatar.value, users: users})
      emit('close')
    }

    const openUpload = () => {
      upload.value.startUpload()
    }

    const sure = url => {
      roomAvatar.value = url
    }

    const goTo = () => {
      emit('to-go', 'SELECT_USER')
    }

    return {
      upload,
      uploading,
      roomName,
      roomAvatar,
      sure,
      openUpload,
      goTo,
      createRoom,

      icons: {
        mdiCamera,
        mdiCheck
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
