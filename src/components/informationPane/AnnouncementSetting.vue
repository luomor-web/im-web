<template>
  <div class="fill-height">
    <drawer-top title="群公告" :sub="true" @close="open('ROOM_INFO')">
      <template #right>
        <v-spacer />
        <v-btn v-if="isAdminOrSubAdmin" icon @click="editAnnouncement">
          <v-icon>{{ isEdit ? 'mdi-close' : 'mdi-pencil' }}</v-icon>
        </v-btn>
      </template>
    </drawer-top>
    <v-card
      class="pa-2  overflow-auto"
      style="height: calc(100% - 64px)"
      elevation="0"
    >
      <v-card-actions v-if="!isEdit && room.announcement">
        <v-list-item class="grow">
          <v-list-item-avatar>
            <v-img
              class="elevation-6"
              alt=""
              :src="room.announcement.avatar"
            />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ room.announcement.username }}</v-list-item-title>
            <v-list-item-subtitle>{{ room.announcement.date }} {{ room.announcement.timestamp }}</v-list-item-subtitle>
          </v-list-item-content>

          <v-row
            align="center"
            justify="end"
          >
            <v-icon class="mr-1" :color="room.announcement.seen ? 'blue' : 'grey'">
              mdi-check-all
            </v-icon>
          </v-row>
        </v-list-item>
      </v-card-actions>

      <v-card-text class="text-h6">
        <v-textarea
          ref="announcement"
          v-model="announcementContent"
          placeholder="暂未发布群公告"
          solo
          auto-grow
          :readonly="!isEdit"
        />
      </v-card-text>
    </v-card>

    <v-fab-transition>
      <v-btn
        v-show="showSure"
        class="mb-16 mr-8"
        absolute
        fab
        right
        bottom
        color="success"
        @click="updateAnnouncement"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-fab-transition>
  </div>
</template>

<script>
import DrawerTop from '@/components/basic/DrawerTop'
import store from '@/store'
import { computed, onMounted, onUnmounted, ref, watch } from '@vue/composition-api'
import msg from '@/plugins/msg'
import { commitAnnouncement } from '@/net/send-message'

export default {
  name: 'NoticeSetting',
  components: {
    DrawerTop
  },
  setup () {
    const isEdit = ref(false)
    const announcement = ref(null)
    const room = computed(() => store.getters.curRoom)
    const currentUserId = computed(() => store.state.currentUserId)
    const announcementContent = ref('')
    const showSure = computed(() => {
      return (room.value.announcement ? room.value.announcement.content.replace('[群公告]\r\n', '') : '') !== announcementContent.value
    })
    // 当前用户
    const curUser = ref(null)
    const isAdminOrSubAdmin = computed(() => {
      return curUser.value?.role === 'ADMIN' || curUser.value?.role === 'SUB_ADMIN'
    })

    onMounted(() => {
      console.log(room.value, 'room')
      resetAnnouncementContent()
      curUser.value = room.value?.users.find(r => r._id === currentUserId.value)
      msg.$on('COMMAND_GROUP_ANNOUNCEMENT_RESP', (data) => {
        const announcement = data.data
        if (currentUserId === announcement.senderId) {
          isEdit.value = false
        }
      })
    })

    onUnmounted(() => {
      msg.$off('COMMAND_GROUP_ANNOUNCEMENT_RESP')
    })

    watch(room, (val) => {
      console.log(room.value, 'room')
      isEdit.value = false
      resetAnnouncementContent()
      curUser.value = val?.users.find(r => r._id === currentUserId.value)
    })

    const resetAnnouncementContent = () => {
      setTimeout(() => {
        announcementContent.value = room.value.announcement ? room.value.announcement.content.replace('[群公告]\r\n', '') : ''
      }, 100)
    }

    const editAnnouncement = () => {
      isEdit.value = !isEdit.value
      if (isEdit.value) {
        announcement.value.focus()
      } else {
        resetAnnouncementContent()
      }
    }

    const updateAnnouncement = () => {
      commitAnnouncement({ roomId: room.value.roomId, content: announcementContent.value })
    }

    const open = (item) => {
      isEdit.value = false
      store.commit('setInformationPane', item)
    }

    return {
      room,
      isEdit,
      announcement,
      showSure,
      isAdminOrSubAdmin,
      open,
      editAnnouncement,
      announcementContent,
      updateAnnouncement
    }
  }
}
</script>

<style scoped>

</style>
