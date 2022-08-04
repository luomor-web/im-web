<template>
  <v-card class="notify-card">
    <div style="padding: 8px 8px 0 8px">
      <span class="font-weight-black card-title">新消息({{ allUnreadCount }})</span>
    </div>
    <v-list class="card-list overflow-y-auto">
      <v-list-item v-for="(item, index) of notify" :key="index" v-ripple class="im-list-item card-list-item"
                   @click="focusChat(item)"
      >
        <v-list-item-avatar :size="32">
          <v-img :src="item.avatar" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ item.roomName }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <div>
            <v-badge
              color="green"
              :content="item.unreadCount"
            />
          </div>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import { onMounted, ref } from '@vue/composition-api'

export default {
  name: 'Notify',
  setup () {
    const notify = ref([])
    const allUnreadCount = ref(0)

    onMounted(() => {
      if (process.env.IS_ELECTRON) {
        window.require('electron').ipcRenderer.on('notify-list', (event, { room, action }) => {
          if (action === 'clear') {
            notify.value = []
            return
          }
          const index = notify.value.findIndex(x => x.roomId === room.roomId)
          if (index !== -1) {
            notify.value.splice(index, 1)
            if (room.unreadCount === 0) {
              numberUnreadCount()
              return
            }
          }
          if (index === -1 && room.unreadCount && room.unreadCount === 0) return
          notify.value.unshift(room)
          numberUnreadCount()
        })
      }
    })

    const numberUnreadCount = () => {
      let count = 0
      for (let i = 0; i < notify.value.length; i++) {
        count += notify.value[i].unreadCount
      }
      allUnreadCount.value = count
    }

    const focusChat = (item) => {
      notify.value = []
      window.require('electron').ipcRenderer.send('focus-chat', item)
    }

    return {
      notify,
      allUnreadCount,
      focusChat
    }
  }
}
</script>

<style scoped lang="scss">
.notify-card {
  width: 220px;
  font-size: 14px;

  .card-title {
    -webkit-app-region: drag;
  }

  .card-list {
    max-height: 384px;

    .card-list-item {
      border-radius: 6px;
      padding: 0 4px 0 8px
    }
  }

  .card-list::-webkit-scrollbar {
    display:none
  }
}
</style>
