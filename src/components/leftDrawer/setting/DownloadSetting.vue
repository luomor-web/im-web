<template>
  <div class="fill-height">
    <drawer-top :title="'下载设置'" :sub="true" @close="open('SETTING_ITEM')"></drawer-top>

    <div class="mx-2 mb-2 mt-8">
      <v-text-field
          outlined
          hide-details="auto"
          label="文件路径"
          required
          :value="downloadPath"
          append-outer-icon="mdi-folder-outline"
          @click:append-outer="selectFolder"
      ></v-text-field>
    </div>

  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {onMounted, ref} from "@vue/composition-api";
import localStoreUtil from "@/utils/local-store";
export default {
  name: "DownloadSetting",
  components: {
    DrawerTop
  },
  setup(props,context){

    const downloadPath = ref('')

    const open = (item) => {
      context.emit('open', item)
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

    const selectFolder = () => {
      window.require('electron').ipcRenderer.invoke('open-file-dialog', downloadPath.value).then((result) => {
        downloadPath.value = result
        localStoreUtil.setValue('download-path', result);
      })
    }

    return {
      open,
      downloadPath,
      selectFolder
    }
  }
}
</script>

<style scoped>

</style>
