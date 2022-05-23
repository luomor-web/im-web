<template>
  <div>
    <drawer-top @close="close" title="下载/上传"></drawer-top>
  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {inject} from "@vue/composition-api";
export default {
  name: "DownloadHistory",
  components: {
    DrawerTop
  },
  setup() {
    const close = inject('close',() => {})

    return {
      close
    }
  }
}
</script>

<style scoped>

</style>
