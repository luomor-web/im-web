<template>
  <div>
    <v-toolbar class="pl-4 pr-4" flat>
      <v-toolbar-title class="font-weight-bold">
        添加会话
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="no-drag" icon @click="closeAddChat">
        <v-icon>
          {{icons.mdiWindowClose}}
        </v-icon>
      </v-btn>
    </v-toolbar>
    <div class="pl-2 pr-2 search">
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
    <div class="users-container">
      <v-list rounded>
        <v-list-item-group
            v-model="items"
            color="primary"
        >
          <v-list-item
              v-for="(item, i) in users"
              :key="i"
              @click="showUserInfo"
          >
            <v-list-item-avatar>
              <v-img :src="item.avatar"></v-img>
            </v-list-item-avatar>
            <v-list-item-content >
              <v-list-item-title v-text="item.username"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="startChat"><v-icon>{{icons.mdiChatOutline}}</v-icon></v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>
  </div>
</template>

<script>
import {mdiMagnify, mdiWindowClose, mdiChatOutline} from "@mdi/js";
import {ref} from "@vue/composition-api";

export default {
  name: "AddChat",
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
      if(!clock.value){
        console.log('showUserInfo')
      }
      clock.value = false
    }

    const startChat = () => {
      console.log('startChat')
      clock.value = true
    }

    return {
      closeAddChat,
      showUserInfo,
      icons:{
        mdiWindowClose,
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
.search{
  height: 64px;
  display: flex;
  align-items: center
}
.users-container {
  overflow-y: auto;
  max-width: 100%;
  padding: 0 8px;
}
</style>
