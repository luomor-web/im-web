<template>
  <div>
    <drawer-top title="群组设置" :sub="true" @close="open('GROUP_EDIT')" />
    <v-list nav>
      <v-subheader class="pl-2">
        群组信息
      </v-subheader>
      <v-list-item v-ripple class="im-list-item">
        <v-list-item-content>
          <v-list-item-title>
            公开群组
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-icon class="pl-1"
                        :size="20"
                        v-bind="attrs"
                        v-on="on"
                >
                  {{ icons.mdiAlertCircleOutline }}
                </v-icon>
              </template>
              <span>设置后其他用户可通过群组检索到此群组</span>
            </v-tooltip>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-switch
            v-model="publicRoom"
            @change="publicRoomChange"
          />
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import DrawerTop from '@/components/basic/DrawerTop'
import store from '@/store'
import { computed, onMounted, ref, watch } from '@vue/composition-api'
import { mdiAlertCircleOutline } from '@mdi/js'
import { setPublicRoom } from '@/net/send-message'

export default {
  name: 'GroupSetting',
  components: {
    DrawerTop
  },
  setup() {
    const publicRoom = ref(false)
    const room = computed(() => store.getters.curRoom)

    onMounted(() => {
      publicRoom.value = !!room.value.publicRoom
    })

    watch(room, () => {
      publicRoom.value = !!room.value.publicRoom
    })
    const publicRoomChange = (item) => {
      setPublicRoom({ roomId: room.value.roomId, publicRoom: item })
    }
    const open = (item) => {
      store.commit('setInformationPane', item)
    }

    return {
      publicRoom,
      open,
      publicRoomChange,
      icons: {
        mdiAlertCircleOutline
      }
    }
  }
}
</script>

<style scoped>

</style>
