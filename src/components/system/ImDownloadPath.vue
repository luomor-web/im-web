<template>
  <v-dialog v-model="downloadAction" width="450">
    <v-card>
      <v-card-title class="text-h5">
        文件下载
      </v-card-title>

      <v-card-text>
          <v-text-field
              label="文件名"
              required
              value="12312312432235235235.jpg"
          ></v-text-field>
          <v-text-field
              hide-details="auto"
              label="文件路径"
              required
              value="C:\user\smart\Downloads"
          ></v-text-field>
          <v-checkbox
              hide-details="auto"
              v-model="checkbox"
              :label="`默认下载地址，不再提示: ${checkbox.toString()}`"
          ></v-checkbox>
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
    const checkbox = ref(false)
    const closeDownloadAction = () => {
    }

    const action = (file) => {
      file.value = file
      downloadAction.value = true
    }

    return {
      file,
      checkbox,
      downloadAction,
      action,
      closeDownloadAction
    }

  }

}
</script>

<style scoped>

</style>
