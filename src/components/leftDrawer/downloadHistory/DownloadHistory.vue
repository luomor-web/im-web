<template>
  <div>
    <drawer-top @close="close" title="文件传输"></drawer-top>
    <v-list>

    </v-list>
  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {inject, onMounted, ref} from "@vue/composition-api";

export default {
  name: "DownloadHistory",
  components: {
    DrawerTop
  },
  setup() {
    const close = inject('close',() => {})

    const tab  = ref('')

    onMounted(()=>{
      window.require('electron').ipcRenderer.on('download-file-start',(event, args)=>{
        console.log('download-file-start',args)
      })
      window.require('electron').ipcRenderer.on('download-file-interrupted',(event, args)=>{
        console.log('download-file-interrupted',args)
      })
      window.require('electron').ipcRenderer.on('download-file-paused',(event, args)=>{
        console.log('download-file-paused',args)
      })
      window.require('electron').ipcRenderer.on('download-file-done',(event, args)=>{
        console.log(args)
      })
    })

    return {
      tab,
      close
    }
  }
}
</script>

<style scoped>

</style>
