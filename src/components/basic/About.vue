<template>
  <v-dialog v-model="action.visible" max-width="290">
    <v-card>
      <v-card-title class="text-h5">
        关于
      </v-card-title>
      <v-card-text>
        <p class="font-weight-regular">
          版本： {{ nowVersion }}
        </p>
        <p class="font-weight-regular">
          版权公告： Copyright © 2022 Courier
        </p>
        <v-btn v-if="isElectron"
               color="primary"
               :loading="loading"
               :disabled="loading"
               @click="checkUpdate"
        >
          检查更新
          <template v-slot:loader>
            <span>Loading...</span>
          </template>
        </v-btn>
        <span>
            {{ returnText }}
        </span>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { onMounted, ref } from '@vue/composition-api'
import log from 'electron-log'
import config from '../../../package.json'

export default {
  name: 'About',
  props: {
    action: { type: Object, default: () => {} }
  },
  setup (props) {
    const loading = ref(false)
    const isElectron = ref(process.env.IS_ELECTRON)

    const returnText = ref('')
    const nowVersion = ref(config.version)

    onMounted(() => {
      if (!isElectron.value) return
      window.require('electron').ipcRenderer.on('update-not-available', (event, info) => {
        log.info('未发现可用更新', info)
        loading.value = false
        if (!props.action.visible) return
        returnText.value = '当前已是最新版本'
      })
      // 当发现一个可用更新的时候触发，更新包下载会自动开始。
      window.require('electron').ipcRenderer.on('update-available', (event, info) => {
        loading.value = false
        if (!props.action.visible) return
        returnText.value = `发现新版本：${info.version}`
      })
      // 当前处于开发者模式下
      window.require('electron').ipcRenderer.on('development-model', () => {
        loading.value = false
        if (!props.action.visible) return
        returnText.value = '开发者模式'
      })
    })

    const checkUpdate = () => {
      loading.value = true
      window.require('electron').ipcRenderer.send('check-update')
    }
    return {
      loading,
      returnText,
      isElectron,
      nowVersion,
      checkUpdate
    }
  }
}
</script>

<style scoped>

</style>
