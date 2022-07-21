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
            icon
            x-large
            v-on="on"
          >
            <v-badge
              color="pink"
              dot
              bottom
              offset-x="10"
              offset-y="10"
              :value="haveDownloadFile"
>
              <v-avatar color="#b7c1ca">
                <img
                  :src="curUser.avatar"
                  :alt="curUser.username"
                />
              </v-avatar>
            </v-badge>
          </v-btn>
        </template>
        <v-card flat class="mt-2">
          <v-list>
            <v-list-item class="im-list-item" @click="openSettingPane('SETTING_ITEM')">
              <v-list-item-icon>
                <v-icon>{{ icons.mdiCog }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                设置
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="isElectron" class="im-list-item" @click="openSettingPane('DOWNLOAD_HISTORY')">
              <v-list-item-icon>
                <v-badge
                  color="pink"
                  dot
                  bottom
                  offset-x="5"
                  offset-y="5"
                  :value="haveDownloadFile"
>
                  <v-icon>{{ icons.mdiCloudDownloadOutline }}</v-icon>
                </v-badge>
              </v-list-item-icon>
              <v-list-item-content>
                上传/下载
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="im-list-item" @click="about.visible = true">
              <v-list-item-icon>
                <v-icon>mdi-information-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                关于
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

      <h3 class="ml-3">
        {{ curUser.username }}
      </h3>
      <v-spacer />
      <v-tooltip v-if="!isElectron" bottom z-index="11">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon
                 v-bind="attrs"
                 @click="downloadDesktop"
                 v-on="on"
>
            <v-icon>{{ icons.mdiLaptop }}</v-icon>
          </v-btn>
        </template>
        <span>客户端下载</span>
      </v-tooltip>
    </div>
    <div v-if="reconnect" class="error-container">
      <v-alert
        border="left"
        type="warning"
        class="mb-0"
        dense
        :icon="icons.mdiAlertOutline"
      >
        网络断线,正在重连...
      </v-alert>
    </div>
    <im-warn-dialog :action="warnAction" />
    <about :action="about" />
  </div>
</template>

<script>
import store from '@/store'
import { computed, onMounted, ref } from '@vue/composition-api'
import { downloadDesktop } from '@/utils/desktop-util'
import { getUserInfo, quitSystem } from '@/net/send-message'
import { mdiAlertOutline, mdiCloudDownloadOutline, mdiCog, mdiExitToApp, mdiLaptop } from '@mdi/js'
import msg from '@/plugins/msg'
import ImWarnDialog from '@/components/basic/ImWarnDialog'
import About from '@/components/basic/About'

export default {
  name: 'RoomsHeader',
  components: {
    About,
    ImWarnDialog
  },
  setup() {
    const reconnect = ref(false)
    const isElectron = ref(process.env.IS_ELECTRON)
    const about = ref({
      visible: false,
      close: () => {
        about.value.visible = false
      }
    })
    const warnAction = ref({
      model: false,
      title: '文件传输',
      content: '当前存在未下载完成的文件,退出将无法继续下载,是否退出?',
      cancel: () => {
        warnAction.value.model = false
      },
      sure: () => {
        quitSystem()
      }
    })
    const currentUserId = computed(() => store.state.currentUserId)
    const curUser = computed(() => store.state.curUser)
    const haveDownloadFile = computed(() => store.getters.haveFileDownloading)

    onMounted(() => {
      msg.$on('SOCKET_RECONNECTING', () => {
        reconnect.value = true
      })
      msg.$on('SOCKET_CONNECTING', () => {
        if (reconnect.value === true) {
          getUserInfo(currentUserId.value)
        }
        reconnect.value = false
      })
    })

    const quit = () => {
      // 检查是否存在下载的任务
      if (haveDownloadFile.value) {
        // 如果有文件正在下载
        warnAction.value.model = true
        return
      }
      quitSystem()
    }

    const openSettingPane = (item) => {
      store.commit('setSettingPane', item)
    }

    return {
      openSettingPane,
      quit,
      curUser,
      about,
      reconnect,
      warnAction,
      isElectron,
      downloadDesktop,
      haveDownloadFile,
      icons: {
        mdiCog,
        mdiCloudDownloadOutline,
        mdiExitToApp,
        mdiAlertOutline,
        mdiLaptop
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
