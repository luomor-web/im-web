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
        ></v-text-field>
        <v-text-field
            hide-details="auto"
            label="文件路径"
            required
            :value="downloadPath"
            append-outer-icon="mdi-folder-outline"
            @click:append-outer="selectFolder"
        ></v-text-field>
        <v-checkbox
            hide-details="auto"
            v-model="checkbox"
            :label="`默认下载地址，不再提示`"
        ></v-checkbox>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

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
import {onMounted, ref} from "@vue/composition-api";
import localStoreUtil from "@/utils/local-store";

export default {
  name: "ImDownloadPath",
  props: {},
  setup() {
    const file = ref(null)
    const downloadAction = ref(false)
    const checkbox = ref(false)
    const downloadPath = ref('')

    const selectFolder = () => {
      window.require('electron').ipcRenderer.invoke('open-file-dialog', downloadPath.value).then((result) => {
        downloadPath.value = result
        localStoreUtil.setValue('download-path', result);
      })

    }

    // 上级组件直接调用
    const action = (downloadFile) => {
      checkbox.value = localStoreUtil.getValue('default-download') !== 'false';
      console.log('action',checkbox.value,localStoreUtil.getValue('default-download'))
      file.value = downloadFile
      if (checkbox.value) {
        sendDownload()
        return
      }

      downloadAction.value = true
    }

    const resetDownload = () => {
      downloadAction.value = false
      // downloadPath.value = localStoreUtil.getValue('download-path');
      checkbox.value = false
    }

    const sendDownload = () => {
      window.require('electron').ipcRenderer.send("download-file", {
        name: file.value.name,
        url: file.value.url,
        downloadPath: downloadPath.value
      })
    }

    const sureDownload = () => {
      localStoreUtil.setValue('default-download', checkbox.value)
      sendDownload()
      downloadAction.value = false
    }

    onMounted(() => {
      const value = localStoreUtil.getValue('download-path');
      if (!value) {
        window.require('electron').ipcRenderer.invoke('downloads-path').then(result => {
          downloadPath.value = result
          localStoreUtil.setValue('download-path', result);
        })
      }
      downloadPath.value = value

      checkbox.value = localStoreUtil.getValue('default-download') !== 'false';
    })

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
