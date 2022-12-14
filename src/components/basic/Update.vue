<template>
  <div>
    <v-snackbar
      v-model="notice"
      :vertical="true"
      :timeout="-1"
      right
      :value="true"
      transition="scroll-x-reverse-transition"
    >
      {{ text }}

      <template #action="{ attrs }">
        <v-btn
          color="primary"
          text
          v-bind="attrs"
          @click="startUpdate"
        >
          {{ incrementUpdateFail ? '下载安装包' : '重启更新' }}
        </v-btn>
        <v-btn
          v-if="!forceUpdate"
          color="error"
          text
          v-bind="attrs"
          @click="notice = false"
        >
          关闭
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>

import { onMounted, ref } from '@vue/composition-api'
import config from '../../../package.json'
import log from 'electron-log'
import { compareVersion } from '@/utils/util'

export default {
  name: 'Update',
  setup () {
    const isElectron = ref(process.env.IS_ELECTRON)

    const version = ref(null)
    const notice = ref(false)
    const text = ref('')
    const incrementUpdateFail = ref(false)
    const incrementUpdate = ref(true)
    const forceUpdate = ref(false)

    onMounted(() => {
      if (isElectron) {
        // 发送版本信息, 防止主线程版本错误
        window.require('electron').ipcRenderer.invoke('win-version', config.version)
        // 有可用更新
        window.require('electron').ipcRenderer.on('update-available', (event, info) => {
          const parse = JSON.parse(info.releaseNotes)

          // 是否全量更新
          const number = compareVersion(config.version, parse.wholeVersion)
          // 只要当前正在运行的版本号小于最后一次强制更新版本 那么就全量更新
          if (number < 0) {
            incrementUpdate.value = false
            const bigForce = compareVersion(info.version, parse.wholeVersion)
            if (bigForce > 0) {
              text.value = `新版本: v${info.version}.您已经很久没有更新了,无法进行增量升级.本次更新为安装更新`
            } else {
              text.value = `新版本: v${info.version}.为了您更好的体验,本次更新为安装更新.`
            }
          }
          // 是否强制更新
          const force = compareVersion(config.version, parse.forceVersion)
          if (force < 0) {
            forceUpdate.value = true
          }

          version.value = info.version
          downloadUpdate()
        })
        window.require('electron').ipcRenderer.on('update-not-available', (event, info) => {
          log.info('未发现可用更新', info)
        })
        // 全量更新下载成功
        window.require('electron').ipcRenderer.on('update-downloaded', () => {
          notice.value = true
          text.value = `新版本: v${version.value},安装包下载成功,点击重启进行安装更新`
        })
        // 增量更新下载成功
        window.require('electron').ipcRenderer.on('increment-update-downloaded', () => {
          notice.value = true
          text.value = `新版本: v${version.value},本次更新为增量更新,点击重启即可更新`
        })
        window.require('electron').ipcRenderer.on('increment-update-fail', () => {
          incrementUpdate.value = false
          incrementUpdateFail.value = true
          notice.value = true
          text.value = `新版本: v${version.value},增量更新处置失败,请联系管理员或点击下载进行全量更新`
        })
        checkUpdate()
      }
    })

    const startUpdate = () => {
      if (incrementUpdateFail.value) {
        incrementUpdateFail.value = false
        downloadUpdate()
        return
      }
      if (incrementUpdate.value) {
        window.require('electron').ipcRenderer.send('increment-install')
        return
      }
      window.require('electron').ipcRenderer.send('quit-and-install')
    }

    const checkUpdate = () => {
      window.require('electron').ipcRenderer.send('check-update')
    }

    const downloadUpdate = () => {
      log.info('是否存在需要下载的版本:', config.version, version.value, config.version === version.value)
      if (config.version !== version.value) {
        if (incrementUpdate.value) {
          log.info('即将下载增量更新')
          window.require('electron').ipcRenderer.send('download-increment-update', version.value)
        } else {
          log.info('即将下载全量更新')
          window.require('electron').ipcRenderer.send('download-update', version.value)
        }
      }
    }

    return {
      notice,
      text,
      version,
      forceUpdate,
      incrementUpdateFail,
      startUpdate
    }
  }
}
</script>

<style scoped>

</style>
