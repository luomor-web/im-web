<template>
  <div>
    <input ref="file" type="file" class="d-none" accept="image/*"
           @change="onFileChange($event.target.files)"
    />

    <v-dialog
      v-model="dialog"
      hide-overlay
      persistent
      width="500"
    >
      <im-cropper :img="img" @sure="sure" @cancel="closeDialog" />
    </v-dialog>
  </div>
</template>

<script>
import ImCropper from '@/components/basic/ImCropper'
import { ref } from '@vue/composition-api'
import { uploadFiles } from '@/utils/upload'
import SparkMD5 from 'spark-md5'

export default {
  name: 'ImUpload',
  components: {
    ImCropper
  },
  setup (props, { emit }) {
    // 文件节点
    const file = ref(null)
    // 文件截图弹窗
    const dialog = ref(false)
    // 待裁剪的文件图片
    const img = ref('')
    // 是否直传
    const directPass = ref(false)

    // 文件选择完毕后执行的动作
    const onFileChange = (files) => {
      const file = files[0]
      if (!directPass.value) {
        dialog.value = true

        img.value = URL.createObjectURL(file)
        return
      }
      directUpload(file)
    }

    const directUpload = (file) => {
      let md5 = ''
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()
      fileReader.onload = e => {
        spark.append(e.target.result)
        md5 = spark.end()
        const typeIndex = file.name.lastIndexOf('.')
        const waitUploadFiles = [{
          name: typeIndex === -1 ? file.name : file.name.substring(0, typeIndex),
          size: file.size,
          type: file.type,
          extension: typeIndex === -1 ? '' : file.name.substring(typeIndex + 1),
          file,
          md5
        }]
        uploadFiles(waitUploadFiles, (file, isOver) => {
          if (isOver) {
            emit('sure', file)
          }
        })
      }
      fileReader.readAsArrayBuffer(file)
    }

    const closeDialog = () => {
      dialog.value = false
      img.value = ''
      emit('cancel')
    }

    const sure = (url) => {
      dialog.value = false
      emit('sure', url)
    }

    const startUpload = (direct) => {
      directPass.value = !!direct
      file.value.click()
    }

    const onFileCancel = () => {
    }

    return {
      startUpload,
      img,
      file,
      dialog,
      directUpload,
      onFileCancel,
      closeDialog,
      sure,
      onFileChange
    }
  }
}
</script>

<style scoped>

</style>
