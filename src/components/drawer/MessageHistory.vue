<template>
  <div>
    <im-drawer title="聊天记录" @close="closeMessageHistory" :direction="true" :visible="visible">
      <template #content="{}">
        <div>
          <div class="overflow-y-auto" :style="containerHeight()">
            <div v-for="(item,index) of messages" :key="index">
              <div class="d-flex align-center py-2">
                <div style="width: 40px">
                  <v-avatar :size="28">
                    <v-img :src="item.avatar"></v-img>
                  </v-avatar>
                </div>
                <span class="subtitle-1 text--secondary">
                {{ item.username }}
              </span>
                <v-spacer></v-spacer>
                <span class="body-2 text--secondary pr-2">
                  {{ item.timestamp }}
                </span>
              </div>
              <v-card flat>
                <div v-if="item.deleted">
                  消息已删除
                </div>
                <div v-for="(file,index) of item.files" :key="index" style="width: 110px;">
                  <v-img
                      aspect-ratio="1"
                      class="mr-2"
                      max-width="110"
                      :src="isImg(file) ? file.url: require('@/assets/images/default/tray-arrow-down.png')">
                  </v-img>
                </div>
                <span style="white-space: pre-line">
                  {{ item.content }}
                </span>
              </v-card>
            </div>
          </div>
          <v-row justify="center">
            <v-col cols="14">
              <v-pagination
                  class="pt-2"
                  v-model="page"
                  :length="pageCount"
                  @input="changePage"
                  @next="nextPage"
                  @previous="previousPage"
              ></v-pagination>
            </v-col>
          </v-row>
        </div>
      </template>
    </im-drawer>
  </div>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {onMounted, ref, watch} from "@vue/composition-api";
import {buildLastMessageTime, messageHistory} from "@/net/message";
import msg from "@/plugins/msg";
import {isImageFile} from "@/utils/media-file";

export default {
  name: "MessageHistory",
  props: {
    visible: Boolean,
    room: Object,
  },
  components: {
    ImDrawer
  },
  setup(props, context) {

    const page = ref(1)
    const number = ref(50)
    const messages = ref([])
    const pageCount = ref(0)

    watch(() => props.visible, (visible) => {
      if (visible === true) {
        getMessage()
      }
    })

    const dateFormat = (item) => {
      return buildLastMessageTime(item).timestamp
    }

    onMounted(() => {
      msg.$on("COMMAND_MESSAGE_HISTORY_RESP", (data) => {
        messages.value = []
        data.data.forEach(x => messages.value.push(buildLastMessageTime(x)))
        pageCount.value = data.page
      })
    })

    const clearData = () => {
      page.value = 1
      messages.value = []
    }

    const getMessage = () => {
      messageHistory({roomId: props.room.roomId, page: page.value, number: number.value})
    }

    const containerHeight = () => {
      return `height: calc(100vh - 164px)`
    }

    const closeMessageHistory = () => {
      clearData()
      context.emit('close')
    }

    const changePage = (item) => {
      page.value = item
      getMessage()
    }

    const nextPage = () => {
      page.value = page.value + 1
      getMessage()
    }

    const previousPage = () => {
      page.value = page.value - 1
      getMessage()
    }

    const isImg = (file) => {
      return isImageFile(file);
    }

    return {
      page,
      pageCount,
      messages,
      dateFormat,
      nextPage,
      previousPage,
      isImg,
      changePage,
      containerHeight,
      closeMessageHistory,
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
