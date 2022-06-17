<template>
  <div class="fill-height">
    <drawer-top @close="close" title="文件传输"></drawer-top>
    <v-list dense class="overflow-y-auto" style="height: calc(100% - 60px)">
      <v-list-item v-ripple v-for="(item,index) of downloadFileList" :key="index" class="im-list-item"
      >
        <v-list-item-avatar tile @click="openFile(item)">
          <v-icon>{{ getIcon(item) }}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content @click="openFile(item)">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle>
            <v-icon :size="20">{{ item.type === 'upload' ? icons.mdiArrowUp : icons.mdiArrowDown }}</v-icon>
            <span v-if="item.state === 'ing'">{{ getFileSize(item.receivedBytes) }} / </span>
            {{ getFileSize(item.totalBytes) }}
            <span v-if="item.state === 'not-found'" style="color: red;float: right">文件不存在</span>
          </v-list-item-subtitle>
          <v-list-item-subtitle v-if="item.state === 'ing'">
            <v-progress-linear
                :buffer-value="item.receivedBytes / item.totalBytes * 100"
                color="cyan"
            ></v-progress-linear>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon v-if="item.state === 'ing'" @click="stopDownload(item)">
            <v-icon>{{ icons.mdiStop }}</v-icon>
          </v-btn>
          <v-menu
              nudge-top="10"
              offset-y
              left
              v-else>
            <template v-slot:activator="{ attrs, on }">
              <v-btn icon
                     v-bind="attrs"
                     v-on="on">
                <v-icon>
                  {{ icons.mdiDotsHorizontal }}
                </v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item class="im-list-item" v-if="item.state === 'not-found'">
                <v-list-item-subtitle @click="againDownload(item)">重新下载</v-list-item-subtitle>
              </v-list-item>
              <v-list-item class="im-list-item" v-if="item.state !== 'not-found'">
                <v-list-item-subtitle @click="openFileLocation(item)">打开文件所在位置</v-list-item-subtitle>
              </v-list-item>
              <v-list-item class="im-list-item">
                <v-list-item-subtitle @click="delHistory(item)">删除记录</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {inject, onMounted, ref} from "@vue/composition-api";
import localStore from "@/utils/local-store";
import {
  mdiApplication,
  mdiArrowDown, mdiArrowUp,
  mdiDotsHorizontal,
  mdiHeadphonesBox,
  mdiHelp,
  mdiImage,
  mdiStop,
  mdiVideoBox,
  mdiZipBox
} from "@mdi/js";
import {isApplicationFile, isAudioFile, isImageFile, isPackageFile, isVideoFile, suffix} from "@/utils/media-file";
import {getFileSize} from "@/utils/file";

export default {
  name: "DownloadHistory",
  components: {
    DrawerTop
  },
  setup() {
    const close = inject('close', () => {
    })
    const downloadFileList = ref([])

    onMounted(() => {
      window.require('electron').ipcRenderer.on('download-file-start', (event, args) => {
        downloadFileList.value.unshift({...args, state: 'start', receivedBytes: 0, totalBytes: 0, type: 'download'})
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
      })
      downloadFileList.value = localStore.getJsonValue('download-file-list');
    })

    const updateDownloadFileState = (args, state) => {
      const index = downloadFileList.value.findIndex(x => x.id === args.id);
      downloadFileList.value[index].state = state
      downloadFileList.value[index].receivedBytes = args.receivedBytes
      downloadFileList.value[index].totalBytes = args.totalBytes
    }

    const getIcon = (item) => {

      const suf = suffix(item.name);
      if (isAudioFile(suf)) return mdiHeadphonesBox
      if (isImageFile(suf)) return mdiImage
      if (isVideoFile(suf)) return mdiVideoBox
      if (isApplicationFile(suf)) return mdiApplication
      if (isPackageFile(suf)) return mdiZipBox
      return mdiHelp

    }

    const delHistory = (item) => {
      const localIndex = downloadFileList.value.findIndex(x => x.id === item.id);
      downloadFileList.value.splice(localIndex, 1);

      const defaultDownloadList = localStore.getJsonValue('download-file-list');
      const index = defaultDownloadList.findIndex(x => x.id === item.id);
      if (index === -1) return
      defaultDownloadList.splice(index, 1)
      localStore.setJsonValue('download-file-list', defaultDownloadList)
    }

    const stopDownload = (item) => {
      window.require('electron').ipcRenderer.invoke('download-file-stop', item).then(() => {
        delHistory(item)
      })
    }

    const openFile = (item) => {
      console.log('openFile')
      window.require('electron').ipcRenderer.invoke('open-file-shell', item).then(result => {
        console.log(result)
        if (!result) {
          updateDownloadFileState(item, 'not-found')
          localStore.setJsonValue('download-file-list', downloadFileList.value)
        }
      })
    }

    const openFileLocation = (item) => {
      console.log('openFileLocation')
      window.require('electron').ipcRenderer.invoke('open-file-folder', item).then(result => {
        console.log(result)
        if (!result) {
          updateDownloadFileState(item, 'not-found')
          localStore.setJsonValue('download-file-list', downloadFileList.value)
        }
      })
    }

    const againDownload = (item) => {
      delHistory(item)
      window.require('electron').ipcRenderer.send("download-file", item, true)
    }

    return {
      close,
      downloadFileList,
      getIcon,
      openFile,
      getFileSize,
      delHistory,
      stopDownload,
      againDownload,
      openFileLocation,
      icons: {
        mdiHelp,
        mdiStop,
        mdiDotsHorizontal,
        mdiArrowDown,
        mdiArrowUp,
      }
    }
  }
}
</script>

<style scoped>

</style>
