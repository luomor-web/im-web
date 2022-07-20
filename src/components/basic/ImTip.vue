<template>
  <v-snackbar
      v-model="snackbar.display"
      :timeout="snackbar.timeout ? 3000 : snackbar.timeout"
  >
    {{ snackbar.text }}

    <template v-slot:action="{ attrs }">
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
export default {
  name: "ImTip",
  props: {
    snackbar: {type: Object}
  }
}
</script>

<style scoped>

</style>
