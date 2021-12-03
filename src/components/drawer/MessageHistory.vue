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

                <format-message
                    v-else-if="item.content"
                    :users="room.users"
                    :content="item.content"
                    :link-options="linkOptions"
                    :text-formatting="textFormatting">
                  <template v-for="(i, name) in $scopedSlots" #[name]="data">
                    <slot :name="name" v-bind="data"/>
                  </template>
                </format-message>

                <div v-else-if="!item.files || item.files.length > 0" class="d-flex">
                  <div v-for="(file,index) of item.files" :key="index" style="width: 365px;">
                    <v-img
                        v-if="isImg(file)"
                        aspect-ratio="1"
                        class="mr-1"
                        max-width="160"
                        :src="file.url"
                        @click="openFile(file,item)">
                    </v-img>
                    <div
                        v-else-if="isVideo(file)"
                        class="vac-video-container"
                    >
                      <video width="100%" height="100%" controls>
                        <source :src="file.url"/>
                      </video>
                    </div>
                    <div v-else class="other-file">
                      <div class="file-body text-line">
                        <v-icon :size="36">{{ icons.mdiDownload }}</v-icon>
                      </div>

                      <div class="file-body">{{ file.name }}</div>
                    </div>
                  </div>
                </div>

                <!--                <div v-for="(file,index) of item.files" :key="index" style="width: 110px;">-->
                <!--                  <v-img-->
                <!--                      aspect-ratio="1"-->
                <!--                      class="mr-2"-->
                <!--                      max-width="110"-->
                <!--                      :src="isImg(file) ? file.url: require('@/assets/images/default/tray-arrow-down.png')">-->
                <!--                  </v-img>-->
                <!--                </div>-->
                <!--                <span style="white-space: pre-line">-->
                <!--                  {{ item.content }}-->
                <!--                </span>-->
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
      <message-viewer :message="clickMessage" :file="clickFile" @close="closeMessageViewer"></message-viewer>
    </im-drawer>
  </div>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {onMounted, ref, watch} from "@vue/composition-api";
import {buildLastMessageTime, messageHistory} from "@/net/message";
import msg from "@/plugins/msg";
import {isImageFile, isVideoFile} from "@/utils/media-file";
import {textFormatting} from "@/locales/text-formart";
import FormatMessage from 'vue-advanced-chat/src/components/FormatMessage/FormatMessage'
import {linkOptions} from "@/locales/link-option";
import {getValue} from "@/utils/local-store";
import {mdiDownload} from "@mdi/js";
import MessageViewer from "@/components/message/MessageViewer";


export default {
  name: "MessageHistory",
  props: {
    visible: Boolean,
    room: Object,
  },
  components: {
    ImDrawer,
    FormatMessage,
    MessageViewer,
  },
  setup(props, context) {

    const page = ref(1)
    const number = ref(50)
    const messages = ref([])
    const pageCount = ref(0)
    const currentUserId = ref(getValue('userId'))
    const clickFile = ref(null)
    const clickMessage = ref(null)

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

    const openFile = (file, message) => {
      console.log(file, message,'file, message')
      clickMessage.value = message
      clickFile.value = file
    }

    const isImg = (file) => {
      return isImageFile(file);
    }

    const isVideo = file => {
      return isVideoFile(file)
    }

    const closeMessageViewer = () => {
      clickMessage.value = null
      clickFile.value = null
    }

    return {
      textFormatting,
      linkOptions,
      currentUserId,
      page,
      pageCount,
      messages,
      clickFile,
      clickMessage,
      openFile,
      isVideo,
      dateFormat,
      nextPage,
      previousPage,
      isImg,
      changePage,
      containerHeight,
      closeMessageHistory,
      closeMessageViewer,

      icons: {
        mdiDownload
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.other-file {
  width: 110px;
  height: 110px;
  border: 1px solid #b7c1ca;
  border-radius: 4px;
  text-align: center;

  .file-body {
    height: 55px;
  }

  .text-line {
    line-height: 55px;
  }
}
</style>
