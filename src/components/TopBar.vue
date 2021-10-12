<template>
  <div class="top">
    <v-toolbar color="deep-purple accent-4" tile>
      <v-spacer></v-spacer>
      <div class="no-drag">
        <v-btn icon @click="handler('min')">
          <v-icon>
            {{ icons.mdiWindowMinimize }}
          </v-icon>
        </v-btn>

        <v-btn icon @click="handler('max')">
          <v-icon>
            {{ icons.mdiWindowMaximize }}
          </v-icon>
        </v-btn>

        <v-btn icon @click="handler('close')">
          <v-icon>
            {{ icons.mdiWindowClose }}
          </v-icon>
        </v-btn>
      </div>
    </v-toolbar>
  </div>
</template>

<script>
import {mdiWindowClose, mdiWindowMaximize, mdiWindowMinimize} from "@mdi/js"

export default {
  name: "TopBar",
  setup() {

    const handler = item => {
      window.require('electron').ipcRenderer.send(item)
    }

    return {
      handler,

      icons: {
        mdiWindowClose,
        mdiWindowMaximize,
        mdiWindowMinimize,
      }
    }
  }
}
</script>

<style scoped>
.top {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}
</style>
