<template>
  <div class="message-history">
    <drawer-top @close="close">
      <template #default>
        <v-text-field v-model="searchName" hide-details rounded dense filled placeholder="搜索" @input="search">
        </v-text-field>
      </template>
      <template #right>
        <v-dialog ref="dialog" v-model="modal" width="470" :return-value.sync="picker">

          <template v-slot:activator="{ on, attrs }">
            <v-btn
                v-bind="attrs"
                v-on="on"
                icon
            >
              <v-icon>{{ icons.mdiCalendarBlankOutline }}</v-icon>
            </v-btn>
          </template>
          <v-date-picker
              :prev-icon="icons.mdiChevronLeft"
              :next-icon="icons.mdiChevronRight"
              v-model="picker"
              :landscape="true"
              :first-day-of-week="0"
              locale="zh-cn"
          >
            <v-spacer></v-spacer>
            <v-btn
                text
                color="primary"
                @click="modal = false"
            >
              取消
            </v-btn>
            <v-btn
                text
                color="primary"
                @click="$refs.dialog.save(picker)"
            >
              确定
            </v-btn>
          </v-date-picker>
        </v-dialog>
      </template>
    </drawer-top>

    <div class="overflow-y-auto message-history-content">
      <v-list nav>
        <v-list-item v-ripple class="im-list-item" v-for="(item,index) of messagesSearched"
                     :key="index" two-line @click="scroll(item)">
          <v-list-item-avatar>
            <v-img :src="item.avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              <div class="d-flex">
                <div>
                  {{ item.username }}
                </div>
                <v-spacer></v-spacer>
                <div class="text-body-2">
                  {{ buildDisplayTime(item.date, item.timestamp) }}
                </div>
              </div>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.content }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>

  </div>
</template>

<script>
import {mdiCalendarBlankOutline, mdiChevronLeft, mdiChevronRight} from "@mdi/js";
import DrawerTop from "@/components/drawer/DrawerTop";
import {inject, onMounted, onUnmounted, ref} from "@vue/composition-api";
import msg from "@/plugins/msg";
import {searchMessage} from "@/net/send-message";
import {buildDisplayTime} from "@/utils/date-util";
import {scrollToView} from "@/utils/dom";
import {startHistoryMessage} from "@/views/home/home";

export default {
  name: "MessageHistory",
  props: {
    room: Object,
  },
  components: {
    DrawerTop
  },

  filters: {},
  setup(props) {
    const modal = ref(false)
    const picker = ref(null)
    const searchName = ref('')

    const messagesSearched = ref([])

    const close = inject('close', () => {
    })

    const open = () => {

    }

    const search = item => {
      if (!item) {
        messagesSearched.value = []
        return
      }

      searchMessage({content: item, roomId: props.room.roomId})
    }

    const scroll = item => {
      const element = document.getElementById(item._id);
      if (!element) {
        startHistoryMessage(item)
        return
      }
      scrollToView(element)
    }

    onMounted(() => {
      msg.$on('COMMAND_SEARCH_MESSAGE_RESP', data => {
        messagesSearched.value = [...data.data]
      })
    })

    onUnmounted(() => {
      msg.$off('COMMAND_SEARCH_MESSAGE_RESP')
    })

    const resetAndClose = () => {
      picker.value = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
      close()
    }

    return {
      modal,
      searchName,
      picker,
      messagesSearched,
      scroll,
      buildDisplayTime,
      search,
      open,
      close,
      resetAndClose,

      icons: {
        mdiCalendarBlankOutline,
        mdiChevronLeft,
        mdiChevronRight,
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.message-history {
  height: 100%;
  width: 100%;
  position: absolute;

  .message-history-content {
    height: 100%;
  }

}
</style>
