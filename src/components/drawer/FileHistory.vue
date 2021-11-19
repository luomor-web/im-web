<template>
  <div>
    <im-drawer title="聊天文件" @close="closeFileHistory" :direction="true" :visible="visible">
      <template #content="{}">
        <div>
          <!--            <div class="d-flex px-2">
                      <v-menu
                          v-model="startDateInput"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                              v-model="startDate"
                              label="开始时间"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="startDate"
                            @input="startDateInput = false"
                        ></v-date-picker>
                      </v-menu>

                      <v-menu
                          v-model="endDateInput"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                              v-model="endDate"
                              label="结束时间"
                              prepend-icon="mdi-calendar"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                            v-model="endDate"
                            @input="endDateInput = false"
                        ></v-date-picker>
                      </v-menu>
                      </div>-->
          <!--          <v-subheader>Offset Top</v-subheader>
                    {{ offsetTop }}-->
          <v-container
              id="scroll-target"
              :style="containerHeight()"
              class="overflow-y-auto"
          >
            <div v-for="(item,index) of fileList" :key="index" v-scroll:#scroll-target="onScroll" class="mb-4">
              <div class="mb-2">
                <span class="subtitle-2">{{ item.date }}</span>
              </div>
              <div class="d-flex flex-row flex-wrap">
                <div v-for="(file,index) of item.files" :key="index" style="width: 110px;">
                  <v-img
                      aspect-ratio="1"
                      class="mr-2"
                      max-width="110"
                      :src="isImg(file) ? file.url: require('@/assets/images/default/tray-arrow-down.png')">
                  </v-img>
<!--                  <span class="body-2">-->
<!--                  {{ file.name.length > 8 ? (file.name.substring(0, 8) + '..') : file.name }}-->
<!--                  {{ file.name }}-->
<!--                </span>-->
                </div>

                <!--              <h2 v-for="(file,index) of item.files" :key="index">
                                <h3>{{file.name}}</h3>
                              </h2>-->
              </div>

            </div>
          </v-container>
        </div>
      </template>

    </im-drawer>
  </div>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {onMounted, ref, watch} from "@vue/composition-api";
import moment from "moment";
import {messageFileHistory} from "@/net/message";
import msg from "@/plugins/msg";
import {isImageFile} from "@/utils/media-file";

export default {
  name: "FileHistory",
  props: {
    visible: Boolean,
    room: Object,
  },
  components: {
    ImDrawer
  },
  setup(props, context) {

    watch(() => props.visible, (visible) => {
      if (visible === true) {
        getMessage()
      }
    })
    const offsetTop = ref(0)
    // 可视高度
    const offsetHeight = ref(0)
    // 实际高度
    const offsetScroll = ref(0)

    const over = ref(false)

    watch(() => offsetTop.value, () => {
      if (!over.value && isRequest()) {
        getMessage();
      }
    })

    const fileList = ref([])
    const startDateInput = ref(false)
    const startDate = ref('')
    const endDateInput = ref(false)
    const endDate = ref('')

    const nowDate = ref(new Date())

    const containerHeight = () => {
      return `max-height: calc(100vh - 64px - 32px)`
    }

    const closeFileHistory = () => {
      resetData()
      context.emit('close')
    }

    const isImg = (file) => {
      return isImageFile(file);
    }

    const resetData = () => {
      nowDate.value = new Date()
      fileList.value = []
      offsetHeight.value = 0
      offsetTop.value = 0
      offsetScroll.value = 0
    }

    const onScroll = (e) => {
      offsetHeight.value = e.target.offsetHeight
      offsetScroll.value = e.target.scrollHeight
      offsetTop.value = e.target.scrollTop
    }

    const getMessage = () => {
      const date = moment(nowDate.value).format("YYYY-MM-DD")
      messageFileHistory({roomId: props.room.roomId, date: date})
    }

    const isRequest = () => {
      return (offsetTop.value + offsetHeight.value) >= offsetScroll.value * 0.75
    }

    onMounted(() => {
      msg.$on("COMMAND_MESSAGE_FILE_HISTORY_RESP", (data) => {
        const {files, hasNext} = data.data
        if (files.length > 0) {
          fileList.value.push({date: moment(nowDate.value).format("YYYY-MM-DD"), files: files})
          fileList.value = [...fileList.value]
        }
        if (hasNext) {
          nowDate.value = moment(nowDate.value).subtract(1, 'd').toDate()
          if(isRequest()){
            getMessage()
          }
        } else {
          over.value = true
        }

        offsetHeight.value = document.getElementById('scroll-target').offsetHeight;
        offsetScroll.value = document.getElementById('scroll-target').scrollHeight;
      })
    })

    return {
      fileList,
      offsetTop,
      startDateInput,
      startDate,
      endDateInput,
      endDate,
      nowDate,
      isImg,
      getMessage,
      containerHeight,
      onScroll,
      closeFileHistory,
    }
  }
}
</script>

<style lang="scss" scoped>

::-webkit-scrollbar {
  display: none
}

</style>
