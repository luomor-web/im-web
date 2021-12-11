<template>
  <div>
    <drawer-top :title="'添加会话'" @close="closeAddChat"></drawer-top>
    <user-select key="ind" :visible="visible" :multiple="false" @close="closeAddChat" @action="startChat"></user-select>
  </div>

</template>

<script>
import {mdiMagnify, mdiChatOutline} from "@mdi/js";
import UserSelect from "@/components/user/UserSelect";
import {ref} from "@vue/composition-api";
import DrawerTop from "@/components/drawer/DrawerTop";

export default {
  name: "AddChat",
  components: {DrawerTop, UserSelect},
  props: {
    visible: Boolean
  },
  setup(props, context) {

    const userSelectModel = ref(false)

    const closeAddChat = () => {
      context.emit('close')
    }

    const startChat = item => {
      context.emit('chat', item)
    }

    return {
      userSelectModel,
      startChat,
      closeAddChat,

      icons: {
        mdiMagnify,
        mdiChatOutline,
      },
    }
  }
}
</script>

<style lang="scss" scoped>
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
