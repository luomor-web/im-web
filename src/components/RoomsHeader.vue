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
            <v-badge
                color="pink"
                dot
                bottom
                offset-x="10"
                offset-y="10"
                :value="haveDownloadFile">
              <v-avatar color="#b7c1ca">
                <img
                    :src="curUser.avatar"
                    :alt="curUser.username"
                >
              </v-avatar>
            </v-badge>
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

            <v-list-item class="im-list-item" @click="openLeftDrawer('DOWNLOAD_HISTORY')" v-if="isElectron">
              <v-list-item-icon>
                <v-badge
                    color="pink"
                    dot
                    bottom
                    offset-x="5"
                    offset-y="5"
                    :value="haveDownloadFile">
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
      <im-download-path ref="downloadPath"></im-download-path>
      <h3 class="ml-3">
        {{ curUser.username }}
      </h3>
      <v-spacer></v-spacer>
      <v-tooltip bottom z-index="11" v-if="!isElectron">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon
                 @click="downloadDesktop"
                 v-bind="attrs"
                 v-on="on">
            <v-icon>{{ icons.mdiLaptop }}</v-icon>
          </v-btn>
        </template>
        <span>客户端下载</span>
      </v-tooltip>
    </div>
    <div class="error-container" v-if="reconnect">
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
    <im-user-select-dialog :action="userAction"></im-user-select-dialog>
    <im-warn-dialog :action="warnAction"></im-warn-dialog>
    <im-tip :snackbar="snackbar" @close="snackbar.display = false"></im-tip>
    <about :action="about"></about>
  </div>
</template>

<script>
import {
  mdiAccountOutline,
  mdiAlertOutline,
  mdiChevronDown,
  mdiCloudDownloadOutline,
  mdiCog,
  mdiExitToApp,
  mdiLaptop,
  mdiPencilOutline
} from "@mdi/js";
import {getUserInfo, quitSystem} from "@/net/send-message";
import {computed, inject, onMounted, ref} from "@vue/composition-api";
import ImDownloadPath from "@/components/system/ImDownloadPath";
import msg from "@/plugins/msg";
import localStoreUtil from "@/utils/local-store";
import localStore from "@/utils/local-store";
import ImWarnDialog from "@/components/system/ImWarnDialog";
import ImTip from "@/components/system/ImTip";
import {downloadDesktop} from "@/utils/desktop-util";
import About from "@/components/update/About";
import ImUserSelectDialog from "@/components/system/ImUserSelectDialog";
import store from "@/store";

export default {
  name: "RoomsHeader",
  props: {},
  components: {
    ImUserSelectDialog,
    About,
    ImWarnDialog,
    ImDownloadPath,
    ImTip
  },
  setup() {
    const currentUserId = computed(() => store.state.currentUserId)

    const curUser = computed(() => store.state.curUser)
    const downloadPath = ref(null)
    const openLeftDrawer = inject('openLeftDrawer', () => {})
    const reconnect = ref(false)
    const haveDownloadFile = ref(false)
    const isElectron = ref(process.env.IS_ELECTRON)
    const about = ref({
      visible: false,
      close: () => {
        about.value.visible = false
      }
    })

    const userAction = ref({
      model: false,
      title: '用户选择',
      sure: () => {

      },
      cancel: () => {
       userAction.value.model = false
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
        clearDownloadFileList();
        store.commit('resetDate')
        quitSystem()
      }
    })

    const snackbar = ref({
      display: false,
      text: '',
      timeout: 1000
    })

    const tip = (text) => {
      snackbar.value.display = true
      snackbar.value.text = text
    }

    const quit = () => {
      // 检查是否存在下载的任务
      if (haveDownloadFile.value) {
        // 如果有文件正在下载
        warnAction.value.model = true
        return
      }
      store.commit('resetDate')
      quitSystem()
    }


    const selectDownloadPath = (file) => {
      downloadPath.value.action(file)
    }

    onMounted(() => {
      msg.$on('SYSTEM_FLUSH_DOWNLOAD_STATE', () => {
        flushDownloadState()
      })
      msg.$on("SOCKET_RECONNECTING", () => {
        reconnect.value = true
      })
      msg.$on("SOCKET_CONNECTING", () => {
        if (reconnect.value === true) {
          getUserInfo(currentUserId.value)
        }
        reconnect.value = false
      })
      if (process.env.IS_ELECTRON) {
        clearDownloadFileList()
        handleDownloadFile()
      }
    })

    const handleDownloadFile = () => {
      window.require('electron').ipcRenderer.on('download-file-start', (event, args) => {
        const downloadFileList = localStoreUtil.getJsonValue('download-file-list') || []

        downloadFileList.unshift({...args, state: 'start', receivedBytes: 0, totalBytes: 0})
        localStoreUtil.setJsonValue('download-file-list', downloadFileList.slice(0, 60))
        haveDownloadFile.value = true
        tip('开始下载')
      })
      window.require('electron').ipcRenderer.on('download-file-interrupted', (event, args) => {
        updateDownloadFileState(args, 'interrupted')
      })
      window.require('electron').ipcRenderer.on('download-file-paused', (event, args) => {
        updateDownloadFileState(args, 'paused')
      })
      window.require('electron').ipcRenderer.on('download-file-ing', (event, args) => {
        updateDownloadFileState(args, 'ing')
      })
      window.require('electron').ipcRenderer.on('download-file-done', (event, args) => {
        updateDownloadFileState(args, 'done')
        flushDownloadState()
        tip('下载完成')
      })
      window.require('electron').ipcRenderer.on('download-file-fail', (event, args) => {
        delHistory(args)
        flushDownloadState()
        tip('下载错误,错误的路径或已被清理')
      })
      window.require('electron').ipcRenderer.on('download-file-cancelled', (event, args) => {
        delHistory(args)
        flushDownloadState()
        tip('下载取消')
      })
    }

    const delHistory = (item) => {
      // 获取缓存的所有下载文件
      const defaultDownloadList = localStore.getJsonValue('download-file-list');
      const index = defaultDownloadList.findIndex(x => x.id === item.id);
      if (index === -1) return
      defaultDownloadList.splice(index, 1)
      localStore.setJsonValue('download-file-list', defaultDownloadList)
    }

    const updateDownloadFileState = (args, state) => {
      // 获取缓存的所有下载文件
      const downloadFileList = localStoreUtil.getJsonValue('download-file-list')
      // 查找ID并设置值
      const index = downloadFileList.findIndex(x => x.id === args.id);
      downloadFileList[index].state = state
      downloadFileList[index].receivedBytes = args.receivedBytes
      downloadFileList[index].totalBytes = args.totalBytes
      localStoreUtil.setJsonValue('download-file-list', downloadFileList)
      return downloadFileList
    }

    const clearDownloadFileList = () => {

      const downloadFileList = localStoreUtil.getJsonValue('download-file-list')
      const downloadFileListTemp = []

      downloadFileList?.forEach(x => {
        if (x.state === 'done' || x.state === 'not-found') {
          downloadFileListTemp.push(x)
        }
      })
      localStoreUtil.setJsonValue('download-file-list', downloadFileListTemp)
    }

    const flushDownloadState = () => {
      const downloadFileList = localStoreUtil.getJsonValue('download-file-list')
      // 检查是否所有的文件全部下载完成，设置没有角标
      const notDoneIndex = downloadFileList.findIndex(x => x.state !== 'done' && x.state !== 'not-found');
      if (notDoneIndex === -1) {
        haveDownloadFile.value = false
      }
    }

    const selectUser = (cb) => {
      userAction.value.sure = cb
      userAction.value.model = true
    }

    return {
      downloadPath,
      openLeftDrawer,
      quit,
      curUser,
      about,
      userAction,
      snackbar,
      reconnect,
      warnAction,
      isElectron,
      selectUser,
      downloadDesktop,
      selectDownloadPath,
      haveDownloadFile,
      icons: {
        mdiPencilOutline,
        mdiAccountOutline,
        mdiChevronDown,
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
