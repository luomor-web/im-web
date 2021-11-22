<template>
  <div>
    <im-drawer title="添加会话" @close="closeAddChat" :visible="visible">
      <template #content="{}">
        <user-select v-if="visible"
                     :multiple="false"
                     :height="96"
                     @action="startChat"
                     @contentClick="showUserInfo">
        </user-select>
      </template>
    </im-drawer>
  </div>
</template>

<script>
import {mdiMagnify, mdiChatOutline} from "@mdi/js";
import ImDrawer from "@/components/drawer/ImDrawer";
import UserSelect from "@/components/user/UserSelect";

export default {
  name: "AddChat",
  components: {UserSelect, ImDrawer},
  props: {
    visible: Boolean
  },
  setup(props, context) {

    const closeAddChat = () => {
      context.emit('close')
    }

    const showUserInfo = (item) => {
      console.log('展示用户信息待处理:', item)
    }

    const startChat = item => {
      context.emit('chat', item)
    }

    return {
      startChat,
      closeAddChat,
      showUserInfo,

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
