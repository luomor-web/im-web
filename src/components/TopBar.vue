<template>
  <div class="top">
    <v-toolbar flat dense>
      <v-spacer></v-spacer>
      <div class="no-drag">
        <v-btn icon @click="handler('min')" dense>
          <v-icon dense>
            {{ icons.mdiWindowMinimize }}
          </v-icon>
        </v-btn>

        <v-btn icon @click="handler('max')" dense>
          <v-icon dense>
            {{ icons.mdiWindowMaximize }}
          </v-icon>
        </v-btn>

        <v-btn icon @click="handler('close')" dense>
          <v-icon dense>
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
