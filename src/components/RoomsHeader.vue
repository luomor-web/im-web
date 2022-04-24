<template>
    <div class="room-header-container">
      <v-menu
          bottom
          min-width="260px"
          :rounded="'lg'"
          offset-y
          transition="scale-transition"
          origin="left top"
      >
        <template v-slot:activator="{ on }">
          <v-btn
              v-on="on"
              icon
              x-large
          >
            <v-avatar color="#b7c1ca">
              <img
                  :src="curUser.avatar"
                  :alt="curUser.username"
              >
            </v-avatar>
          </v-btn>
        </template>
        <v-card flat
                class="mt-2">
          <v-list>
            <v-list-item class="im-list-item" @click="openLeftDrawer('SETTING')">
              <v-list-item-icon>
                <v-icon>{{ icons.mdiCog }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                设置
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="im-list-item" @click="quit">
              <v-list-item-icon>
                <v-icon>{{ icons.mdiExitToApp }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                退出
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

      </v-menu>

      <h3 class="ml-3">
        {{ curUser.username }}
      </h3>
      <v-spacer></v-spacer>
    </div>
</template>

<script>
import {mdiAccountOutline, mdiChevronDown, mdiCog, mdiExitToApp, mdiPencilOutline} from "@mdi/js";
import {quitSystem} from "@/net/message";
import {inject} from "@vue/composition-api";

export default {
  name: "RoomsHeader",
  props: {
    curUser: Object,
  },
  components: {},
  setup() {
    const openLeftDrawer = inject('openLeftDrawer', () => {})

    const quit = () => {
      quitSystem()
    }

    return {

      openLeftDrawer,
      quit,
      icons: {
        mdiPencilOutline,
        mdiAccountOutline,
        mdiChevronDown,
        mdiCog,
        mdiExitToApp
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.room-header-container {
  position: sticky;
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 15px;
}
</style>
