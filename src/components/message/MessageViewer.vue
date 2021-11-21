<template>

  <ImageViewer
      v-if="imageViewVisible"
      :url-list="urlList"
      :on-close="closeImageViewer"
  ></ImageViewer>

</template>

<script>
import {watch, onMounted, ref} from "@vue/composition-api";
import ImageViewer from "@/components/system/ImageViewer";
import {isImageFile} from "@/utils/media-file";
import {downloadForUrl} from "@/utils/download"

export default {
  name: "MessageViewer",
  props: {
    message: Object,
    file: Object
  },
  components: {
    ImageViewer,
  },

  setup(props, context) {
    const imageViewVisible = ref(false)
    const urlList = ref([])

    watch(() => props.file, file => {
      console.log(file)
      if (!file) return

      if (file.action === 'download') {
        downloadForUrl(file.file.url,file.file.name)
        return
      }

      if (isImageFile(file.file)) {
        urlList.value.push(file.file.url)
        imageViewVisible.value = true

      }

    })

    const closeImageViewer = () => {
      imageViewVisible.value = false
      urlList.value = []
      context.emit('close')
    }

    onMounted(() => {

    })

    return {
      urlList,
      imageViewVisible,
      closeImageViewer
    }
  }

}
</script>

<style scoped>

</style>