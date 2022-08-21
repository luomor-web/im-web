<template>
  <v-scale-transition>
    <div v-if="isGroup" class="im-room-announcement">
      <v-alert
        v-model="showAnnouncement"
        border="left"
        color="cyan"
        dense
        dark
        icon="mdi-bullhorn-variant-outline"
        class="align-baseline"
        dismissible
        @input="closeAnnouncement"
      >
        <span @click="open">
          {{ announcement.content }}
        </span>
      </v-alert>
    </div>
  </v-scale-transition>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from '@vue/composition-api'
import store from '@/store'
import msg from '@/plugins/msg'

export default {
  name: 'RoomAnnouncement',
  setup() {
    const showAnnouncement = ref(false)
    const room = computed(() => store.getters.curRoom)
    const isGroup = computed(() => room.value && !room.value.isFriend && !room.value.isSystem)
    const announcement = ref({ })

    onMounted(() => {
      msg.$on('SHOW_ANNOUNCEMENT', (data) => {
        if (!data) {
          announcement.value = room.value.announcement
        } else {
          announcement.value = { ...data }
        }
        console.log(announcement.value, 'SHOW_ANNOUNCEMENT')
        showAnnouncement.value = true
      })
    })

    onUnmounted(() => {
      msg.$off('SHOW_ANNOUNCEMENT')
    })

    watch(room, (val, old) => {
      if (old && val.roomId !== old.roomId) {
        showAnnouncement.value = false
      }
    })

    const open = () => {
      store.commit('setInformationPane', 'ANNOUNCEMENT_SETTING')
    }

    const closeAnnouncement = (item) => {
      showAnnouncement.value = item
    }
    return {
      open,
      room,
      isGroup,
      announcement,
      showAnnouncement,
      closeAnnouncement
    }
  }
}
</script>

<style scoped lang="scss">

.im-room-announcement {
  position: absolute;
  top: 64px;
  width: 100%;
  z-index: 12;
  padding: 12px 50px;
}

::v-deep .v-alert__content {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
