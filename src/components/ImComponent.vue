<template>
  <div>
    <im-download-path ref="downloadPath"/>
    <download-state @tip="tip"/>
    <im-tip :snackbar="snackbar" @close="snackbar.display = false"/>
    <im-user-select-dialog :model="forwardModel" :types="['CHAT','PERSON']" @sure="forwardSure" @cancel="forwardCancel"
                           multiple/>
  </div>
</template>

<script>
import {computed, ref} from "@vue/composition-api/dist/vue-composition-api";
import store from "@/store";
import ImTip from "@/components/basic/ImTip";
import DownloadState from "@/components/basic/DownloadState";
import ImDownloadPath from "@/components/basic/ImDownloadPath";
import ImUserSelectDialog from "@/components/basic/ImUserSelectDialog";
import {forwardMessage} from "@/net/send-message";

export default {
  name: "ImComponent",
  components: {
    ImUserSelectDialog,
    ImTip,
    DownloadState,
    ImDownloadPath
  },
  setup() {

    const settingPane = computed(() => store.state.settingPane)
    const downloadPath = ref(null)
    const snackbar = ref({})
    const forwardModel = ref(false)
    const forwardMessages = ref([])

    const selectDownloadPath = (file) => {
      downloadPath.value.action(file)
    }

    const forward = (messages) => {
      forwardMessages.value = messages
      forwardModel.value = true
    }

    const forwardSure = (data) => {
      const {chats, users} = data
      console.log(chats, users, forwardMessages.value)
      const filter = chats.filter(r => users.findIndex(x => x._id === r.friendId) === -1).map(x => x.roomId);
      const userIds = users.map(x => x._id);
      forwardMessage({chats: filter,users: userIds,messages:forwardMessages.value})
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
