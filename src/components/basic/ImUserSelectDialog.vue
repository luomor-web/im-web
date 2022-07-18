<template>
  <v-dialog v-model="action.model" width="600">
    <v-card height="500">
      <v-toolbar
          flat
          color="primary"
          dark
          class="px-3"
      >
        <v-toolbar-title>选择</v-toolbar-title>

        <v-spacer/>
        <v-text-field  hide-details rounded dense filled placeholder="搜索" />
        <v-btn
            icon
            class="hidden-xs-only"
        >
          <v-icon>mdi-folder-outline</v-icon>
        </v-btn>
        <v-btn
            icon
            class="hidden-xs-only"
        >
          <v-icon>mdi-folder-outline</v-icon>
        </v-btn>
      </v-toolbar>
      <div style="height: calc(100% - 64px)" class="d-flex">
      <v-tabs vertical>
        <v-tab>
          <v-icon left>
            mdi-account
          </v-icon>
          会话
        </v-tab>
        <v-tab>
          <v-icon left>
            mdi-lock
          </v-icon>
          用户
        </v-tab>
        <v-tab>
          <v-icon left>
            mdi-access-point
          </v-icon>
          群组
        </v-tab>

        <v-tab-item>
          <v-card flat>
            <v-list nav>
              <v-list-item v-ripple v-for="(item,index) of loadedRooms" :key="index" >
                <v-list-item-avatar>
                  <v-img :src="item.avatar"/>
                </v-list-item-avatar>
                <v-list-item-content >
                  <v-list-item-title>{{ item.roomName }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <slot name="userAction" :item="item"/>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          {{'你好'}}
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <v-card-text>
              {{'你好'}}
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
      </div>
    </v-card>
  </v-dialog>
</template>
<script>

import {computed} from "@vue/composition-api";
import store from "@/store";

export default {
  name: "ImUserSelectDialog",
  props: {
    action: Object,
  },
  setup(props) {
    const loadedRooms = computed(() => store.state.loadedRooms)

    const cancel = () => {
      props.action.cancel()
    }

    const sure = () => {
      props.action.sure()
    }

    return {
      loadedRooms,
      sure,
      cancel
    }
  }
}
</script>
