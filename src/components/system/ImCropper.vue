<template>
  <div>
    <v-card>
      <v-card-title class="text-h5">
        裁剪
      </v-card-title>
      <v-card-text>
        <cropper class="cropper"
                 ref="cropper"
                 :src="img"
                 :stencilProps="{aspectRatio: 1}"
        ></cropper>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            @click="cancel"
        >
          取消
        </v-btn>
        <v-btn
            color="primary"
            @click="sure"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>

  </div>
</template>

<script>
import {ref} from "@vue/composition-api";
import {Cropper} from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.compact.css';
import {addFiles} from "@/utils/file";
import SparkMD5 from "spark-md5"

export default {
  name: "ImCropper",
  components: {
    Cropper
  },
  props: {
    img: String
  },
  setup(props, context) {
    const cropper = ref(null)
    const picUrl = ref(process.env.VUE_APP_PIC_URL)

    const cancel = () => {
      context.emit("cancel")
    }

    const sure = () => {
      const {canvas} = cropper.value.getResult();
      if (canvas) {
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();
        canvas.toBlob(blob => {
          let md5 = ""
          fileReader.onload = e => {
            spark.append(e.target.result);
            md5 = spark.end()

            const file = {
              blob: blob,
              name: 'header',
              size: blob.size,
              type: 'image/jpeg',
              extension: 'jpeg',
              md5: md5
            }
            addFiles([file], (file, over) => {
              if (over) {
                context.emit("sure", picUrl.value + file.url)
              }
            })
          }
          fileReader.readAsArrayBuffer(blob)

        }, 'image/jpeg')
      }
    }

    return {
      cropper,
      cancel,
      sure
    }
  }
}
</script>

<style lang="scss" scoped>
.cropper {
  height: 300px;
  background: #DDD;
}
</style>
