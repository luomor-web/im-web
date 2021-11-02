<template>
  <div>
    <v-navigation-drawer
        v-model="drawerVisible"
        absolute
        :temporary="temporary"
        width="400"
        @input="changeVisible"
    >
      <v-toolbar class="pl-4 pr-4" flat color="#1976d2">
        <v-toolbar-title class="font-weight-bold white--text">
          {{ title }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn class="no-drag" icon @click="close">
          <v-icon class="white--text">
            {{ icons.mdiWindowClose }}
          </v-icon>
        </v-btn>
      </v-toolbar>
      <div class="pl-4 pr-4 pt-4">
        <slot name="content"></slot>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import {mdiWindowClose} from "@mdi/js";
import {ref, watch} from "@vue/composition-api";

export default {
  name: "ImDrawer",
  props: {
    title: String,
    visible: Boolean,
    temporary: {
      type: Boolean,
      default: true
    }
  },
  setup(props, context) {
    const drawerVisible = ref(false)
    watch(() => props.visible, () => {
      drawerVisible.value = props.visible
    })

    const close = () => {
      context.emit('close')
    }
    const changeVisible = (item) => {
      if (!item) {
        close();
      }
    }
    return {
      close,
      changeVisible,
      drawerVisible,
      icons: {
        mdiWindowClose
      }
    }
  }
}
</script>

<style scoped>

</style>
