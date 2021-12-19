<template>
  <div>
    <drawer-top @close="close" :title="'历史消息'">

    </drawer-top>
  </div>
</template>

<script>
import {mdiDownload} from "@mdi/js";
import DrawerTop from "@/components/drawer/DrawerTop";

export default {
  name: "MessageHistory",
  props: {
    room: Object,
  },
  components: {
    DrawerTop
  },
  setup(props, {emit}) {

    const close = () => {
      emit('close')
    }

    return {

      close,

      icons: {
        mdiDownload
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.other-file {
  width: 110px;
  height: 110px;
  border: 1px solid #b7c1ca;
  border-radius: 4px;
  text-align: center;

  .file-body {
    height: 55px;
  }

  .text-line {
    line-height: 55px;
  }
}
</style>
