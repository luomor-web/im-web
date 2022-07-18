<template>
  <div />
</template>

<script>
import store from "@/store";
import {onMounted} from "@vue/composition-api";
import {ref} from "@vue/composition-api/dist/vue-composition-api";

export default {
  name: "DownloadState",
  emits:['tip'],
  setup(props,{emit}) {
    const snackbar = ref({
      display: false,
      text: '',
      timeout: 1000
    })

    onMounted(() => {
      if(!process.env.IS_ELECTRON) return
      store.commit('clearDownloadingItem')
      window.require('electron').ipcRenderer.on('download-file-start', (event, args) => {
        store.commit('pushDownloadItem', {...args, state: 'start', receivedBytes: 0, totalBytes: 0})
        tip('开始下载')
      })
      window.require('electron').ipcRenderer.on('download-file-interrupted', (event, args) => {
        store.commit('updateDownloadItem', {args, status: 'interrupted'})
      })
      window.require('electron').ipcRenderer.on('download-file-paused', (event, args) => {
        store.commit('updateDownloadItem', {args, status: 'paused'})
      })
      window.require('electron').ipcRenderer.on('download-file-ing', (event, args) => {
        store.commit('updateDownloadItem', {args, status: 'ing'})
      })
      window.require('electron').ipcRenderer.on('download-file-done', (event, args) => {
        store.commit('updateDownloadItem', {args, status: 'done'})
        tip('下载完成')
      })
      window.require('electron').ipcRenderer.on('download-file-fail', (event, args) => {
        store.commit('removeDownloadItem', args)
        tip('下载错误,错误的路径或已被清理')
      })
      window.require('electron').ipcRenderer.on('download-file-cancelled', (event, args) => {
        store.commit('removeDownloadItem', args)
        tip('下载取消')
      })
    })

    const tip = (text) => {
      snackbar.value.display = true
      snackbar.value.text = text
      emit('tip', snackbar.value)
    }
  }
}
</script>

<style scoped>

</style>
