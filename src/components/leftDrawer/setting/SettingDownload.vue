<template>
  <div class="fill-height">
    <drawer-top :title="'下载设置'" :sub="true" @close="open('SETTING_ITEM')"></drawer-top>

    <v-list nav>
      <v-subheader>下载设置</v-subheader>
      <v-list-item v-ripple class="im-list-item">
        <v-list-item-icon>
          <v-icon>{{ icons.mdiHelp }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>下载时不询问</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-switch
              v-model="autoDownload"
              @change="autoDownloadChange"
          ></v-switch>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-list nav>
      <v-subheader>下载目录</v-subheader>
      <v-list-item v-ripple class="im-list-item">
        <v-list-item-content>
          <v-list-item-title>
            <v-text-field
                outlined
                dense
                hide-details="auto"
                label=""
                required
                :value="downloadPath"
            ></v-text-field>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click="selectFolder">
            <v-icon>{{ icons.mdiFolderOutline }}</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import DrawerTop from "@/components/basic/DrawerTop";
import {computed, onMounted, ref, watch} from "@vue/composition-api";
import localStoreUtil from "@/utils/local-store";
import {mdiCheck, mdiFolderOutline, mdiHelp} from "@mdi/js";
import store from "@/store";

export default {
  name: "SettingDownload",
  components: {
    DrawerTop
  },
  setup() {
    const downloadPath = ref('')
    const autoDownload = ref(false)
    const downloadPathStore = computed(() => store.state.downloadPath)
    const autoDownloadStore = computed(() => store.state.loadingRooms)

    onMounted(() => {
      autoDownload.value = autoDownloadStore.value
      downloadPath.value = downloadPathStore.value
    })

    watch(downloadPathStore, () => {
      downloadPath.value = downloadPathStore.value
    })

    watch(autoDownloadStore, () => {
      autoDownload.value = autoDownloadStore.value
    })

    const autoDownloadChange = (item) => {
      store.commit('setAutoDownload', item)
    }

    const selectFolder = () => {
      window.require('electron').ipcRenderer.invoke('open-file-dialog', downloadPath.value).then((result) => {
        downloadPath.value = result
        store.commit('setDownloadPath', result)
      })
    }

    const open = (item) => {
      store.commit('setSettingPane', item)
    }

    return {
      open,
      downloadPath,
      selectFolder,
      autoDownload,
      autoDownloadChange,

      icons: {
        mdiCheck,
        mdiFolderOutline,
        mdiHelp
      }
    }
  }
}
</script>

<style scoped>

</style>
