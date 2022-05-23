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
            @click="downloadAction = false"
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

    const action = (downloadFile) => {
      file.value = downloadFile
      downloadAction.value = true
    }

    const sureDownload = () => {
      localStoreUtil.setValue('default-download',checkbox.value   )
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
    })

    return {
      file,
      checkbox,
      downloadAction,
      downloadPath,
      action,
      selectFolder,
      sureDownload
    }

  }

}
</script>

<style scoped>

</style>
