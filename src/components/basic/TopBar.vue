<template>
  <div class="top">
    <v-toolbar height="32px" flat style="padding: 0">
      <span class="ml-3">信使</span>
      <v-spacer />
      <div class="no-drag">
        <v-btn icon dense @click="handler('min')">
          <v-icon>
            {{ icons.mdiWindowMinimize }}
          </v-icon>
        </v-btn>

        <v-btn icon dense @click="handler('max')">
          <v-icon dense>
            {{ icons.mdiWindowMaximize }}
          </v-icon>
        </v-btn>

        <v-btn icon dense @click="handler('close')">
          <v-icon dense>
            {{ icons.mdiWindowClose }}
          </v-icon>
        </v-btn>
      </div>
    </v-toolbar>
    <update />
  </div>
</template>

<script>
import { mdiWindowClose, mdiWindowMaximize, mdiWindowMinimize } from '@mdi/js'
import Update from '@/components/basic/Update'

export default {
  name: 'TopBar',
  components: { Update },
  setup() {
    const handler = item => {
      window.require('electron').ipcRenderer.send(item)
    }

    return {
      handler,

      icons: {
        mdiWindowClose,
        mdiWindowMaximize,
        mdiWindowMinimize
      }
    }
  }
}
</script>

<style scoped lang="scss">
.top {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

.v-toolbar__content {
  padding: 0 !important;
}
</style>
