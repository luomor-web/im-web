<template>
  <v-snackbar
      v-model="snackbar.display"
      :timeout="snackbar.timeout ? 3000 : snackbar.timeout"
  >
    {{ snackbar.text }}

    <template #action="{ attrs }">
      <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="$emit('close')"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { watch } from '@vue/composition-api'

export default {
  name: 'ImTip',
  props: {
    snackbar: { type: Object, default: () => { } }
  },
  setup (props) {
    watch(() => props.snackbar, (value) => {

    })
  }
}
</script>

<style scoped>

</style>
