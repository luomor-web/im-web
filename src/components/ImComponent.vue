<template>
  <div>
    <im-download-path ref="downloadPath" />
    <download-state @tip="tip" />
    <im-tip :snackbar="snackbar" @close="snackbar.display = false" />
    <im-user-select-dialog :model="forwardModel" :types="['CHAT','PERSON']" multiple @sure="forwardSure"
                           @cancel="forwardCancel"
    />
  </div>
</template>

<script>
import store from '@/store'
import ImTip from '@/components/basic/ImTip'
import DownloadState from '@/components/basic/DownloadState'
import ImDownloadPath from '@/components/basic/ImDownloadPath'
import ImUserSelectDialog from '@/components/basic/ImUserSelectDialog'
import { forwardMessage } from '@/net/send-message'
import { onMounted, computed, ref } from '@vue/composition-api'

export default {
  name: 'ImComponent',
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

    onMounted(() => {
      if (process.env.IS_ELECTRON) {
        window.require('electron').ipcRenderer.on('change-room', (event, roomId) => {
          store.commit('changeRoom', roomId)
        })
      }
    })

    const selectDownloadPath = (file) => {
      downloadPath.value.action(file)
    }

    const forward = (messages) => {
      forwardMessages.value = messages
      forwardModel.value = true
    }

    const forwardSure = (data) => {
      const { chats, users } = data
      const filter = chats.filter(r => users.findIndex(x => x._id === r.friendId) === -1).map(x => x.roomId)
      const userIds = users.map(x => x._id)
      forwardMessage({ chats: filter, users: userIds, messages: forwardMessages.value })
      forwardModel.value = false
    }

    const forwardCancel = () => {
      forwardModel.value = false
    }

    const tip = (item) => {
      snackbar.value = { ...item }
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
