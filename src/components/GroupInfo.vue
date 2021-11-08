<template>
  <div>
    <im-drawer title="群组信息" @close="closeGroupInfo" :visible="visible" :direction="direction" :temporary="drawerTemporary">

    </im-drawer>
  </div>
</template>

<script>
import ImDrawer from "@/components/ImDrawer";
import {ref} from "@vue/composition-api";

export default {
  name: "GroupInfo",
  props: {
    visible: Boolean,
    direction: Boolean,
    room: Object
  },
  components: {
    ImDrawer
  },
  setup(props,context) {
    const drawerTemporary = ref(true)
    const closeGroupInfo = () => {
      context.emit('close')
    }

    return {
      drawerTemporary,
      closeGroupInfo
    }
  }
}
</script>

<style scoped>

</style>
