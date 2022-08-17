<template>
  <div />
</template>

<script>
import store from '@/store'
import { onMounted } from '@vue/composition-api'
import tip from '@/plugins/tip'

export default {
  name: 'DownloadState',
  emits: ['tip'],
  setup() {
    onMounted(() => {
      if (!process.env.IS_ELECTRON) return
      store.commit('clearDownloadingItem')
      window.require('electron').ipcRenderer.on('download-file-start', (event, args) => {
        store.commit('pushDownloadItem', { ...args, state: 'start', receivedBytes: 0, totalBytes: 0 })
        tip.info('开始下载', 1000)
      })
      window.require('electron').ipcRenderer.on('download-file-interrupted', (event, args) => {
        store.commit('updateDownloadItem', { args, status: 'interrupted' })
      })
      window.require('electron').ipcRenderer.on('download-file-paused', (event, args) => {
        store.commit('updateDownloadItem', { args, status: 'paused' })
      })
      window.require('electron').ipcRenderer.on('download-file-ing', (event, args) => {
        store.commit('updateDownloadItem', { args, status: 'ing' })
      })
      window.require('electron').ipcRenderer.on('download-file-done', (event, args) => {
        store.commit('updateDownloadItem', { args, status: 'done' })
        tip.info('下载完成', 1000)
      })
      window.require('electron').ipcRenderer.on('download-file-fail', (event, args) => {
        store.commit('removeDownloadItem', args)
        tip.info('下载错误,错误的路径或已被清理', 1000)
      })
      window.require('electron').ipcRenderer.on('download-file-cancelled', (event, args) => {
        store.commit('removeDownloadItem', args)
        tip.info('下载取消', 1000)
      })
    })
  }
}
</script>

<style scoped>

</style>
