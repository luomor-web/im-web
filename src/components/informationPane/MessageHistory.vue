<template>
  <div class="message-history">
    <drawer-top @close="close">
      <template #default>
        <v-text-field v-model="searchName" hide-details rounded dense filled placeholder="搜索" @input="search"/>
      </template>
      <template #right>
        <v-dialog ref="dialog" v-model="modal" width="470" :return-value.sync="picker" @input="pickerDataChange">

          <template v-slot:activator="{ on, attrs }">
            <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                :color="picker.length === 2 ? 'primary' : ''"
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
              range
          >
            <v-spacer/>
            <v-btn
                text
                color="primary"
                @click="resetPicker"
            >
              重置
            </v-btn>
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
            <v-img :src="item.avatar"/>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              <div class="d-flex">
                <div>
                  {{ item.username }}
                </div>
                <v-spacer/>
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
import DrawerTop from "@/components/basic/DrawerTop";
import {computed, onMounted, onUnmounted, ref} from "@vue/composition-api";
import msg from "@/plugins/msg";
import {searchMessage} from "@/net/send-message";
import {buildDisplayTime} from "@/utils/date-util";
import {scrollToView} from "@/utils/dom";
import store from "@/store";

export default {
  name: "MessageHistory",
  components: {
    DrawerTop
  },

  filters: {},
  setup() {
    const modal = ref(false)
    const startDate = ref(null)
    const endDate = ref(null)
    const picker = ref([])
    const searchName = ref('')
    const room = computed(() => store.getters.curRoom)
    const messagesSearched = ref([])

    onMounted(() => {
      msg.$on('COMMAND_SEARCH_MESSAGE_RESP', data => {
        messagesSearched.value = [...data.data]
      })
    })

    onUnmounted(() => {
      msg.$off('COMMAND_SEARCH_MESSAGE_RESP')
    })

    const search = item => {
      if (!item) {
        messagesSearched.value = []
        return
      }
      searchMessage({content: item, roomId: room.value.roomId, startDate: startDate.value, endDate: endDate.value})
    }

    const scroll = item => {
      // 是否在当前已加载的消息列表中 如果在的话直接跳转

      // 否则的话刷掉
      const element = document.getElementById(item._id);
      if (!element) {
        store.commit('setSearchMessage', true)
        store.commit('clearMessages')
        store.commit('pushMessage', item)

        setTimeout(() => {
          const element = document.getElementById(item._id);
          scrollToView(element)
        }, 1000)
        return
      }
      scrollToView(element)
    }

    const resetPicker = () => {
      picker.value = []
    }

    const pickerDataChange = (item) => {
      if (picker.value.length === 2 && !item) {
        startDate.value = picker.value[0]
        endDate.value = picker.value[1]
        search(searchName.value)
      }
    }

    const close = () => {
      store.commit('setInformationPane', '')
    }

    return {
      modal,
      searchName,
      picker,
      messagesSearched,
      scroll,
      buildDisplayTime,
      search,
      resetPicker,
      close,
      pickerDataChange,

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
