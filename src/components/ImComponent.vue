<template>
  <div>
    <im-download-path ref="downloadPath"/>
    <download-state @tip="tip"/>
    <im-tip :snackbar="snackbar" @close="snackbar.display = false"/>
    <im-user-select-dialog :model="forwardModel" :types="['CHAT','PERSON']" @sure="forwardSure" @cancel="forwardCancel" multiple/>
  </div>
</template>

<script>
import {computed, ref} from "@vue/composition-api/dist/vue-composition-api";
import store from "@/store";
import ImTip from "@/components/basic/ImTip";
import DownloadState from "@/components/basic/DownloadState";
import ImDownloadPath from "@/components/basic/ImDownloadPath";
import ImUserSelectDialog from "@/components/basic/ImUserSelectDialog";

export default {
  name: "ImComponent",
  components:{
    ImUserSelectDialog,
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
    const forwardModel = ref(false)

    const selectDownloadPath = (file) => {
      downloadPath.value.action(file)
    }

    const forward = () => {
      forwardModel.value = true
    }

    const forwardSure = (data) => {
      forwardModel.value = false
    }

    const forwardCancel = () => {
      forwardModel.value = false
    }

    const tip = (item) => {
      snackbar.value = {...item}
      console.log(snackbar)
    }

    return {
      forward,
      settingPane,
      userAction,
      snackbar,
      downloadPath,
      forwardModel,
      forwardSure,
      forwardCancel,
      tip,
      selectDownloadPath
    }
  }
}
</script>

<style scoped>

</style>
