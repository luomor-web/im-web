<template>
  <v-dialog v-model="downloadAction" width="350">
    <v-card>
      <v-card-title class="text-h5">
        文件下载
      </v-card-title>

      <v-card-text>
        Let Google help apps determine location. This means sending anonymous location data to Google, even when no
        apps are running.
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
            color="green darken-1"
            text
            @click="downloadAction = false"
        >
          取消
        </v-btn>

        <v-btn
            color="green darken-1"
            text
            @click="downloadAction = false"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {ref} from "@vue/composition-api";

export default {
  name: "ImDownloadPath",
  props: {
  },
  setup() {
    const file = ref(null)
    const downloadAction = ref(false)
    const closeDownloadAction = () => {
    }

    const action = (file) => {
      file.value = file
      downloadAction.value = true
    }

    return {
      file,
      downloadAction,
      action,
      closeDownloadAction
    }

  }

}
</script>

<style scoped>

</style>
