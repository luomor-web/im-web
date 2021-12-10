<template>
  <div>
    <v-speed-dial
        class="mr-8 mb-8"
        v-model="fab"
        absolute
        right
        bottom
        direction="top"
        :transition="'slide-y-reverse-transition'"
    >
      <template v-slot:activator>
        <v-btn
            v-model="fab"
            color="blue darken-2"
            dark
            fab
        >
          <v-icon v-if="fab">
            mdi-close
          </v-icon>
          <v-icon v-else>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        nihao
      </v-card>

    </v-speed-dial>
  </div>

</template>

<script>
import {ref} from "@vue/composition-api";

export default {
  name: "FloatMenu",
  props:{},
  setup(){

    const fab = ref(false)

    return {
      fab
    }

  }
}
</script>

<style scoped>

</style>
