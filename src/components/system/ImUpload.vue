<template>
<div>
  <input type="file" ref="file" class="d-none" accept="image/*"
         @change="onFileChange($event.target.files)">

  <v-dialog
      hide-overlay
      persistent
      v-model="dialog"
      width="500"
  >
    <im-cropper :img="img" @sure="sure" @cancel="closeDialog"></im-cropper>
  </v-dialog>

</div>
</template>

<script>
import ImCropper from "@/components/system/ImCropper";
import {ref} from "@vue/composition-api";

export default {
  name: "ImUpload",
  props: {
  },
  components:{
    ImCropper
  },
  setup(props,{emit}){
    // 文件节点
    const file = ref(null)
    // 文件截图弹窗
    const dialog = ref(false)
    // 待裁剪的文件图片
    const img = ref('')

    // 文件选择完毕后执行的动作
    const onFileChange = (files) => {
      console.log(files,'文件选中完毕')
      dialog.value = true

      img.value = URL.createObjectURL(files[0])
    }

    const closeDialog = () => {
      dialog.value = false
      img.value = ''
      emit('cancel')
    }

    const sure = (url) => {
      dialog.value = false
      emit('sure',url)
    }

    const startUpload = () => {
      file.value.click()
    }


    const onFileCancel = () => {
        console.log('cancel...')
    }

    return {
      startUpload,
      img,
      file,
      dialog,
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