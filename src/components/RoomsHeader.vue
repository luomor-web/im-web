<template>
  <div class="room-header">
    <div class="room-header-container">
      <v-menu
          bottom
          min-width="260px"
          :rounded="'lg'"
          offset-y
          transition="scale-transition"
          origin="left top"
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
        <v-card flat class="mt-2">
          <v-list>
            <v-list-item class="im-list-item" @click="openLeftDrawer('SETTING')">
              <v-list-item-icon>
                <v-icon>{{ icons.mdiCog }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                设置
              </v-list-item-content>
            </v-list-item>

          <v-list-item class="im-list-item" @click="openLeftDrawer('DOWNLOAD_HISTORY')">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiCloudDownloadOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              上传/下载
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
      <im-download-path ref="downloadPath"></im-download-path>
      <h3 class="ml-3">
        {{ curUser.username }}
      </h3>
      <v-spacer></v-spacer>
    </div>
    <div class="error-container" v-if="reconnect">
      <v-alert
          border="left"
          type="warning"
          class="mb-0"
      >
        网络断线,正在重连...
      </v-alert>
    </div>
  </div>
</template>

<script>
import {
  mdiAccountOutline,
  mdiChevronDown,
  mdiCloudDownloadOutline,
  mdiCog,
  mdiExitToApp, mdiLoading,
  mdiPencilOutline
} from "@mdi/js";
import {getUserInfo, quitSystem} from "@/net/send-message";
import {inject, onMounted, ref} from "@vue/composition-api";
import ImDownloadPath from "@/components/system/ImDownloadPath";
import msg from "@/plugins/msg";
import {currentUserId} from "@/views/home/home";

export default {
  name: "RoomsHeader",
  props: {
    curUser: Object,
  },
  components: {
    ImDownloadPath
  },
  setup() {
    const downloadPath = ref(null)
    const openLeftDrawer = inject('openLeftDrawer', () => {})
    const reconnect = ref(false)

    const quit = () => {
      quitSystem()
    }

    const selectDownloadPath = (file) => {
      downloadPath.value.action(file)
    }

    onMounted(()=>{
      msg.$on("SOCKET_RECONNECTING",() => {
        reconnect.value = true
      })
      msg.$on("SOCKET_CONNECTING",() => {
        if(reconnect.value === true){
          getUserInfo(currentUserId.value)
        }
        reconnect.value = false
      })
    })

    return {

      downloadPath,
      openLeftDrawer,
      quit,
      reconnect,
      selectDownloadPath,
      icons: {
        mdiPencilOutline,
        mdiAccountOutline,
        mdiChevronDown,
        mdiCog,
        mdiCloudDownloadOutline,
        mdiExitToApp,
        mdiLoading
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

.error-container {
}
</style>
