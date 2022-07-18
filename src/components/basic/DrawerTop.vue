<template>
  <div>
    <v-toolbar class="pl-4 pr-4" flat>
      <v-btn class="no-drag" icon @click="close">
        <v-icon>
          {{ sub ? icons.mdiArrowLeft : icons.mdiWindowClose }}
        </v-icon>
      </v-btn>
      <slot>
        <v-toolbar-title class="font-weight-bold ">
          {{ title  }}
        </v-toolbar-title>
      </slot>
      <slot name="right" />
    </v-toolbar>
  </div>
</template>

<script>
import { mdiArrowLeft, mdiPencilOutline, mdiWindowClose } from "@mdi/js";

export default {
  name: "DrawerTop",

  props: {
    title: {type: String, default: ''},
    sub: {type: Boolean, default: false}
  },

  setup(props, {emit}) {

    const close = () => {
      emit('close')
    }

    return {

      close,

      icons: {
        mdiWindowClose,
        mdiPencilOutline,
        mdiArrowLeft,
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@import "../../styles/theme";


</style>
