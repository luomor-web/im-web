<template>
  <div>
    <im-download-path ref="downloadPath" />
    <download-state />
    <im-user-select-dialog :model="forwardModel" :types="['CHAT','PERSON']" multiple @sure="forwardSure"
                           @cancel="forwardCancel"
    />
  </div>
</template>

<script>
import store from '@/store'
import DownloadState from '@/components/basic/DownloadState'
import ImDownloadPath from '@/components/basic/ImDownloadPath'
import ImUserSelectDialog from '@/components/basic/ImUserSelectDialog'
import { forwardMessage } from '@/net/send-message'
import { onMounted, computed, ref } from '@vue/composition-api'

export default {
  name: 'ImComponent',
  components: {
    ImUserSelectDialog,
    DownloadState,
    ImDownloadPath
  },
  setup() {
    const settingPane = computed(() => store.state.settingPane)
    const downloadPath = ref(null)
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

    return {
      forward,
      settingPane,
      downloadPath,
      forwardModel,
      forwardSure,
      forwardCancel,
      selectDownloadPath
    }
  }
}
</script>

<style scoped>

</style>
