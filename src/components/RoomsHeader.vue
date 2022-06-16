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

            <v-list-item class="im-list-item" @click="openLeftDrawer('DOWNLOAD_HISTORY')">
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
          dense
          :icon="icons.mdiAlertOutline"
      >
        网络断线,正在重连...
      </v-alert>
      <im-warn-dialog :action="warnAction"></im-warn-dialog>
    </div>
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
  mdiPencilOutline
} from "@mdi/js";
import {getUserInfo, quitSystem} from "@/net/send-message";
import {inject, onMounted, ref} from "@vue/composition-api";
import ImDownloadPath from "@/components/system/ImDownloadPath";
import msg from "@/plugins/msg";
import {currentUserId} from "@/views/home/home";
import localStoreUtil from "@/utils/local-store";
import ImWarnDialog from "@/components/system/ImWarnDialog";

export default {
  name: "RoomsHeader",
  props: {
    curUser: Object,
  },
  components: {
    ImWarnDialog,
    ImDownloadPath
  },
  setup() {
    const downloadPath = ref(null)
    const openLeftDrawer = inject('openLeftDrawer', () => {
    })
    const reconnect = ref(false)
    const haveDownloadFile = ref(false)
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

    const quit = () => {
      // 检查是否存在下载的任务
      if (haveDownloadFile.value) {
        // 如果有文件正在下载
        warnAction.value.model = true
        return
      }
      quitSystem()
    }

    const selectDownloadPath = (file) => {
      downloadPath.value.action(file)
    }

    onMounted(() => {
      msg.$on("SOCKET_RECONNECTING", () => {
        reconnect.value = true
      })
      msg.$on("SOCKET_CONNECTING", () => {
        if (reconnect.value === true) {
          getUserInfo(currentUserId.value)
        }
        reconnect.value = false
      })
      handleDownloadFile()
    })

    const handleDownloadFile = () => {
      window.require('electron').ipcRenderer.on('download-file-start', (event, args) => {
        const downloadFileList = localStoreUtil.getJsonValue('download-file-list') || []

        downloadFileList.unshift({...args, state: 'start', receivedBytes: 0, totalBytes: 0})
        localStoreUtil.setJsonValue('download-file-list', downloadFileList)
        haveDownloadFile.value = true
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
        const downloadFileList = updateDownloadFileState(args, 'done')
        // 检查是否所有的文件全部下载完成，设置没有角标
        const notDoneIndex = downloadFileList.findIndex(x => x.state !== 'done' && x.state !== 'not-found');
        if (notDoneIndex === -1) {
          haveDownloadFile.value = false
        }
      })
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

    return {

      downloadPath,
      openLeftDrawer,
      quit,
      reconnect,
      warnAction,
      selectDownloadPath,
      haveDownloadFile,
      icons: {
        mdiPencilOutline,
        mdiAccountOutline,
        mdiChevronDown,
        mdiCog,
        mdiCloudDownloadOutline,
        mdiExitToApp,
        mdiAlertOutline
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
