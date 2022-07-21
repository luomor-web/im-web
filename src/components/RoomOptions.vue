<template>
  <div>
    <div class="d-flex">
      <div class="mr-2">
        <v-btn v-show="!room.isSystem" icon @click="call('AUDIO')">
          <v-icon>{{ icons.mdiPhone }}</v-icon>
        </v-btn>
      </div>
      <div class="mr-2">
        <v-btn v-show="!room.isSystem" icon @click="call('VIDEO')">
          <v-icon>{{ icons.mdiVideoOutline }}</v-icon>
        </v-btn>
      </div>
      <div v-show="!room.isSystem" class="mr-2">
        <v-btn icon @click="openInformationPane('MESSAGE_HISTORY')">
          <v-icon>{{ icons.mdiMagnify }}</v-icon>
        </v-btn>
      </div>
    </div>

    <im-video-dialog ref="videoDialog" :room="room" />
</div>
</template>

<script>
import { mdiDotsVertical, mdiMagnify, mdiPhone, mdiVideoOutline } from '@mdi/js'
import { computed, ref } from '@vue/composition-api'
import ImVideoDialog from '@/components/basic/ImVideoDialog'
import store from '@/store'

export default {
  name: 'RoomOptions',
  components: { ImVideoDialog },
  setup() {
    const room = computed(() => store.getters.curRoom)

    const videoDialog = ref(null)

    const call = (type) => {
      videoDialog.value.call(type)
    }

    const openInformationPane = (item) => {
      store.commit('setInformationPane', item)
    }

    return {
      room,
      videoDialog,
      openInformationPane,

      call,

      icons: {
        mdiMagnify,
        mdiDotsVertical,
        mdiVideoOutline,
        mdiPhone
      }
    }
  }
}
</script>

<style scoped>

</style>
