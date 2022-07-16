<template>
  <div>
    <im-download-path ref="downloadPath"></im-download-path>
    <download-state @tip="tip"></download-state>
    <im-tip :snackbar="snackbar" @close="snackbar.display = false"></im-tip>
    <im-user-select-dialog :action="userAction"></im-user-select-dialog>
    <float-menu v-show="!settingPane"></float-menu>
  </div>
</template>

<script>
import ImDownloadPath from "@/components/basic/ImDownloadPath";
import {computed, ref} from "@vue/composition-api/dist/vue-composition-api";
import DownloadState from "@/components/basic/DownloadState";
import ImTip from "@/components/basic/ImTip";
import ImUserSelectDialog from "@/components/basic/ImUserSelectDialog";
import FloatMenu from "@/components/basic/FloatMenu";
import store from "@/store";

export default {
  name: "ImComponent",
  components:{
    DownloadState,
    ImDownloadPath,
    ImTip,
    ImUserSelectDialog,
    FloatMenu,
  },
  setup(){

    const settingPane = computed(() => store.state.settingPane)
    const downloadPath = ref(null)
    const snackbar = ref({})
    const userAction = ref({
      model: false,
      title: '用户选择',
      sure: () => {

      },
      cancel: () => {
        userAction.value.model = false
      }
    })

    const selectDownloadPath = (file) => {
      downloadPath.value.action(file)
    }

    const tip = (item) => {
      snackbar.value = {...item}
      console.log(snackbar)
    }

    return {
      settingPane,
      userAction,
      snackbar,
      downloadPath,

      tip,
      selectDownloadPath
    }
  }
}
</script>

<style scoped>

</style>