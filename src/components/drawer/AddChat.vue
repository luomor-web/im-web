<template>
  <div>
    <user-select :visible="visible" :multiple="false" @close="closeAddChat" @action="startChat"></user-select>
<!--    <im-drawer title="添加会话" @close="closeAddChat" :visible="visible">
      <template #content="{}">
        <user-select v-if="visible"
                     :multiple="false"
                     :height="96"
                     @action="startChat">
        </user-select>
      </template>
    </im-drawer>-->
  </div>
</template>

<script>
import {mdiMagnify, mdiChatOutline} from "@mdi/js";
import UserSelect from "@/components/user/UserSelect";
import {ref} from "@vue/composition-api";

export default {
  name: "AddChat",
  components: {UserSelect},
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
