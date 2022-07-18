<template>
  <div>
    <im-download-path ref="downloadPath"/>
    <download-state @tip="tip"/>
    <im-tip :snackbar="snackbar" @close="snackbar.display = false"/>
  </div>
</template>

<script>
import {computed, ref} from "@vue/composition-api/dist/vue-composition-api";
import store from "@/store";
import ImTip from "@/components/basic/ImTip";
import DownloadState from "@/components/basic/DownloadState";
import ImDownloadPath from "@/components/basic/ImDownloadPath";

export default {
  name: "ImComponent",
  components:{
    ImTip,
    DownloadState,
    ImDownloadPath
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
