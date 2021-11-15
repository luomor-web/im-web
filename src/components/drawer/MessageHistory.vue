<template>
  <div>
    <im-drawer title="聊天记录" @close="closeMessageHistory" :direction="true"  :visible="visible">

    </im-drawer>
  </div>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
export default {
  name: "MessageHistory",
  props: {
    visible: Boolean
  },
  components: {
    ImDrawer
  },
  setup(props, context) {

    const closeMessageHistory = () => {
      context.emit('close')
    }

    return {
      closeMessageHistory,
    }
  }
}
</script>

<style scoped>

</style>
