<template>
  <div>
    <v-toolbar class="pl-4 pr-4" flat color="#1976d2">
      <v-toolbar-title class="font-weight-bold white--text">
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="no-drag" icon @click="close">
        <v-icon class="white--text">
          {{icons.mdiWindowClose}}
        </v-icon>
      </v-btn>
    </v-toolbar>
    <div class="pl-4 pr-4 pt-4">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
import {mdiWindowClose} from "@mdi/js";

export default {
  name: "ImDrawer",
  props:{
    title:{
      type: String,
      default: ''
    }
  },
  setup(props, context){
    const close = () => {
      context.emit('close')
    }

    return {
      close,

      icons: {
        mdiWindowClose
      }
    }
  }
}
</script>

<style scoped>

</style>
