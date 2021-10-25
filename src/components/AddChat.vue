<template>
  <div>
    <im-drawer title="添加会话" @close="closeAddChat">
      <template #content="{}">
        <div class="d-flex align-center ">
          <v-text-field
              dense
              required
              rounded
              outlined
              :prepend-inner-icon="icons.mdiMagnify"
              placeholder="搜索"
              :hide-details="true"
          ></v-text-field>
        </div>
        <div class="overflow-y-auto pt-3">
          <v-list>
            <v-list-item
                v-for="(item, i) in users"
                :key="i"
                @click="showUserInfo"
            >
              <v-list-item-avatar>
                <v-img :src="item.avatar"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-text="item.username"></v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click="startChat(item)">
                  <v-icon>{{ icons.mdiChatOutline }}</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </div>
      </template>
    </im-drawer>
  </div>
</template>

<script>
import {mdiMagnify, mdiChatOutline} from "@mdi/js";
import {ref} from "@vue/composition-api";
import ImDrawer from "@/components/ImDrawer";

export default {
  name: "AddChat",
  components: {ImDrawer},
  props: {
    users: {
      default: () => {
        []
      },
      type: Array
    }
  },
  setup(props, context) {

    const items = ref([])
    const clock = ref(false)

    const closeAddChat = () => {
      context.emit('close')
    }

    const showUserInfo = () => {
      if (!clock.value) {
        console.log('showUserInfo')
      }
      clock.value = false
    }

    const startChat = item => {
      console.log('startChat')
      context.emit('chat', item)
      clock.value = true
    }

    return {
      closeAddChat,
      showUserInfo,
      icons: {
        mdiMagnify,
        mdiChatOutline,
      },
      items,
      startChat
    }
  }
}
</script>

<style lang="scss" scoped>
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
