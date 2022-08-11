<template>
  <div class="fill-height">
    <drawer-top title="文件传输" @close="close" />
    <v-list dense class="overflow-y-auto" style="height: calc(100% - 64px)">
      <v-list-item v-for="(item,index) of downloadFileList" :key="index" v-ripple class="im-list-item">
        <v-list-item-avatar tile @click="openFile(item)">
          <v-icon>{{ getIcon(item) }}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content @click="openFile(item)">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle>
            <v-icon :size="20">
              {{ item.type === 'upload' ? icons.mdiArrowUp : icons.mdiArrowDown }}
            </v-icon>

            <span v-if="isDownloading(item)">{{ getFileSize(item.receivedBytes) }} / </span>

            {{ getFileSize(item.totalBytes) }}
            <span v-if="isNotFound(item)" style="color: red;float: right">文件不存在</span>
          </v-list-item-subtitle>
          <v-list-item-subtitle v-if="isDownloading(item)">
            <v-progress-linear
              :buffer-value="item.receivedBytes / item.totalBytes * 100"
              color="cyan"
            />
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn v-if="item.state === 'ing'" icon @click="stopDownload(item)">
            <v-icon>{{ icons.mdiStop }}</v-icon>
          </v-btn>
          <v-menu
            v-else
            nudge-top="10"
            offset-y
            left
          >
            <template #activator="{ attrs, on }">
              <v-btn icon
                     v-bind="attrs"
                     v-on="on"
              >
                <v-icon>
                  {{ icons.mdiDotsHorizontal }}
                </v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item v-if="item.state === 'not-found'" class="im-list-item">
                <v-list-item-subtitle @click="againDownload(item)">
                  重新下载
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="item.state !== 'not-found'" class="im-list-item">
                <v-list-item-subtitle @click="openFileLocation(item)">
                  打开文件所在位置
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item class="im-list-item">
                <v-list-item-subtitle @click="delHistory(item)">
                  删除记录
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import DrawerTop from '@/components/basic/DrawerTop'
import { computed } from '@vue/composition-api'
import {
  mdiApplication,
  mdiArrowDown,
  mdiArrowUp,
  mdiDotsHorizontal,
  mdiHeadphonesBox,
  mdiHelp,
  mdiImage,
  mdiStop,
  mdiVideoBox,
  mdiZipBox
} from '@mdi/js'
import { isApplicationFile, isAudioFile, isImageFile, isPackageFile, isVideoFile, suffix } from '@/utils/media-file'
import { getFileSize } from '@/utils/util'
import store from '@/store'

export default {
  name: 'DownloadHistory',
  components: {
    DrawerTop
  },
  setup () {
    const downloadFileList = computed(() => store.state.downloadItemList)

    const getIcon = (item) => {
      const suf = suffix(item.name)
      if (isAudioFile(suf)) return mdiHeadphonesBox
      if (isImageFile(suf)) return mdiImage
      if (isVideoFile(suf)) return mdiVideoBox
      if (isApplicationFile(suf)) return mdiApplication
      if (isPackageFile(suf)) return mdiZipBox
      return mdiHelp
    }

    const stopDownload = (item) => {
      window.require('electron').ipcRenderer.invoke('download-file-stop', item).then(() => {
        store.commit('removeDownloadItem', item)
      })
    }

    const delHistory = (item) => {
      store.commit('removeDownloadItem', item)
    }

    const openFile = (item) => {
      window.require('electron').ipcRenderer.invoke('open-file-shell', item).then(result => {
        if (!result) {
          store.commit('updateDownloadItem', { args: item, status: 'not-found' })
        }
      })
    }

    const openFileLocation = (item) => {
      window.require('electron').ipcRenderer.invoke('open-file-folder', item).then(result => {
        if (!result) {
          store.commit('updateDownloadItem', { args: item, status: 'not-found' })
        }
      })
    }

    const againDownload = (item) => {
      store.commit('removeDownloadItem', item)
      window.require('electron').ipcRenderer.send('download-file', item, true)
    }

    const isDownloading = (item) => {
      return item.state === 'ing'
    }

    const isNotFound = (item) => {
      return item.state === 'not-found'
    }

    const close = () => store.commit('setSettingPane', '')

    return {
      downloadFileList,
      close,
      delHistory,
      getIcon,
      openFile,
      getFileSize,
      isDownloading,
      isNotFound,
      stopDownload,
      againDownload,
      openFileLocation,
      icons: {
        mdiHelp,
        mdiStop,
        mdiDotsHorizontal,
        mdiArrowDown,
        mdiArrowUp
      }
    }
  }
}
</script>

<style scoped>

</style>
