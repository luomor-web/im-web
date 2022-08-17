<template>
  <v-snackbar
      v-model="display"
      :timeout="timeout ? 3000 : timeout"
  >
    {{ text }}

    <template #action="{ attrs }">
      <v-btn
          color="#d3205d"
          text
          v-bind="attrs"
          @click="close"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { ref } from '@vue/composition-api'

export default {
  name: 'ImSnackbar',
  setup () {
    const display = ref(false)
    const timeout = ref(3000)
    const text = ref('')

    const info = (msg, t) => {
      text.value = msg
      display.value = true
      timeout.value = t || 3000
    }

    const close = () => {
      display.value = false
    }

    return {
      info,
      close,
      display,
      timeout,
      text
    }
  }
}
</script>

<style scoped>

</style>
