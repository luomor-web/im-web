<template>
  <div>
    <drawer-top :title="'编辑资料'" :sub="true" @close="open('SETTING_ITEM')"/>
    <div class="mt-2">
      <div class="mx-2">
        <div class="d-table ma-auto">
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
      </div>
    </div>

    <im-upload ref="upload" @sure="sure"/>

    <div class="mx-2 mb-2 mt-8">
      <v-text-field
        v-model="username"
        label="用户名称"
        hide-details="auto"
        outlined
      />
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
        <v-icon>{{ icons.mdiCheck }}</v-icon>
      </v-btn>
    </v-fab-transition>
  </div>
</template>

<script>
import {mdiCamera, mdiCheck} from "@mdi/js";
import {computed, onMounted, ref, watch} from "@vue/composition-api";
import {editProfile} from "@/net/send-message";
import DrawerTop from "@/components/basic/DrawerTop";
import ImUpload from "@/components/basic/ImUpload";
import store from "@/store";

export default {
  name: "SettingUserProfile",
  components: {
    ImUpload,
    DrawerTop,
  },
  setup() {
    const user = computed(() => store.state.curUser)
    const upload = ref(null)
    const username = ref('')

    watch(user, () => {
      initData()
    })

    // 当前是否可以确认
    const showSure = computed(() => {
      return username.value !== user.value.username && username.value !== ''
    })


    onMounted(() => {
      initData()
    })

    const initData = () => {
      username.value = user.value.username
    }

    const changeUserProfile = (url) => {
      editProfile({userId: user.value._id, avatar: url, name: username.value})
    }

    const sure = (url) => {
      changeUserProfile(url)
    }

    const openUpload = () => {
      upload.value.startUpload()
    }

    const open = (item) => {
      initData()
      store.commit('setSettingPane', item)
    }

    return {
      user,
      upload,
      username,
      showSure,
      open,
      sure,
      changeUserProfile,
      openUpload,

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
