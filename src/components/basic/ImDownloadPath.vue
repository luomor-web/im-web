<template>
  <v-dialog v-model="downloadAction" width="450" v-if="downloadAction">
    <v-card>
      <v-card-title class="text-h5">
        文件下载
      </v-card-title>

      <v-card-text>
        <v-text-field
            label="文件名"
            required
            :value="file.name"
        />
        <v-text-field
            hide-details="auto"
            label="文件路径"
            required
            :value="downloadPath"
            append-outer-icon="mdi-folder-outline"
            @click:append-outer="selectFolder"
        />
        <v-checkbox
            hide-details="auto"
            v-model="checkbox"
            :label="`默认下载地址，不再提示`"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer/>

        <v-btn
            color="green darken-1"
            text
            @click="resetDownload"
        >
          取消
        </v-btn>

        <v-btn
            color="green darken-1"
            text
            @click="sureDownload"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {computed, onMounted, ref} from "@vue/composition-api";
import {uuid} from "@/utils/id-util";
import store from "@/store";

export default {
  name: "ImDownloadPath",
  setup() {
    const file = ref(null)
    const downloadAction = ref(false)
    const checkbox = ref(false)
    const downloadPath = ref('')
    const downloadPathStore = computed(() => store.state.downloadPath)
    const autoDownloadStore = computed(() => store.state.loadingRooms)

    onMounted(() => {
      if (!process.env.IS_ELECTRON) {
        return
      }
      if (!downloadPathStore.value) {
        window.require('electron').ipcRenderer.invoke('downloads-path').then(result => {
          downloadPath.value = result
          store.commit('setDownloadPath', result)
        })
      }
      store.commit('setAutoDownload', !!autoDownloadStore.value)
    })

    // 上级组件直接调用
    const action = (downloadFile) => {
      checkbox.value = autoDownloadStore.value
      downloadPath.value = downloadPathStore.value
      file.value = downloadFile
      if (checkbox.value) {
        sendDownload()
        return
      }
      downloadAction.value = true
    }

    const selectFolder = () => {
      window.require('electron').ipcRenderer.invoke('open-file-dialog', downloadPath.value).then((result) => {
        downloadPath.value = result
        store.commit('setDownloadPath', result)
      })
    }

    const resetDownload = () => {
      downloadAction.value = false
      checkbox.value = false
    }

    const sendDownload = () => {
      window.require('electron').ipcRenderer.send("download-file", {
        id: uuid(),
        name: file.value.name,
        url: file.value.url,
        downloadPath: downloadPath.value
      })
    }

    const sureDownload = () => {
      store.commit('setAutoDownload', checkbox.value)
      sendDownload()
      downloadAction.value = false
    }

    return {
      file,
      checkbox,
      downloadPath,
      downloadAction,
      action,
      selectFolder,
      resetDownload,
      sureDownload
    }
  }
}
</script>

<style scoped>

</style>
