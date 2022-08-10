<template>
  <div>
    <v-menu
      v-model="fab"
      :close-on-content-click="false"
      nudge-top="10"
      top
      left
      offset-y
      transition="scale-transition"
      origin="right bottom"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          :class="{'mr-8': true, 'mb-16': true}"
          color="blue darken-2"
          absolute
          dark
          bottom
          right
          fab
          v-bind="attrs"
          v-on="on"
        >
          <v-icon v-if="fab">
            {{ icons.mdiClose }}
          </v-icon>
          <v-icon v-else>
            {{ icons.mdiPencil }}
          </v-icon>
        </v-btn>
      </template>

      <v-card width="200" rounded="lg">
        <v-list>
          <v-list-item class="im-list-item" @click="openAddChat">
            <v-list-item-icon>
              <v-icon>
                {{ icons.mdiAccountOutline }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              添加会话
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="im-list-item" @click="openCreateGroup">
            <v-list-item-icon>
              <v-icon>
                {{ icons.mdiAccountSupervisorOutline }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              创建群组
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="im-list-item" @click="openSearchGroup">
            <v-list-item-icon>
              <v-icon>
                {{ icons.mdiAccountSearchOutline }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              搜索群组
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
    <im-user-select-dialog :model="add" :types="types" @cancel="closeSelect" @sure="sureSelect" />
  </div>
</template>

<script>
import { computed, ref } from '@vue/composition-api'
import { mdiAccountOutline, mdiAccountSearchOutline, mdiAccountSupervisorOutline, mdiClose, mdiPencil } from '@mdi/js'
import ImUserSelectDialog from '@/components/basic/ImUserSelectDialog'
import { createGroup, joinUserGroup } from '@/net/send-message'
import store from '@/store'

export default {
  name: 'FloatMenu',
  components: { ImUserSelectDialog },
  setup() {
    const fab = ref(false)
    const add = ref(false)
    const types = ref([])
    const loadedRooms = computed(() => store.state.loadedRooms)
    const currentUserId = computed(() => store.state.currentUserId)

    const openAddChat = () => {
      types.value = ['PERSON']
      add.value = true
      fab.value = false
    }

    const openSearchGroup = () => {
      types.value = ['GROUP']
      add.value = true
      fab.value = false
    }

    const closeSelect = () => {
      add.value = false
    }

    const sureSelect = (item) => {
      add.value = false

      const isPerson = types.value.includes('PERSON')
      if (isPerson) {
        const room = loadedRooms.value.find(r => item._id === r.friendId)
        if (!room) {
          createGroup({ isFriend: true, roomName: '好友会话', users: [{ _id: item._id }] })
          return
        }
        store.commit('upRoom', room.roomId)
        store.commit('changeRoom', room.roomId)
        return
      }
      const room = loadedRooms.value.find(r => item.roomId === r.roomId)
      if (!room) {
        const users = {
            _id: currentUserId.value
          }
        const group = {
          roomId: item.roomId
        }
        joinUserGroup({ group, users })
        return
      }
      store.commit('upRoom', room.roomId)
      store.commit('changeRoom', room.roomId)
    }

    const openCreateGroup = () => {
      store.commit('setSettingPane', 'CREATE_GROUP')
    }

    return {
      fab,
      add,
      types,
      openAddChat,
      closeSelect,
      sureSelect,
      openCreateGroup,
      openSearchGroup,

      icons: {
        mdiAccountSupervisorOutline,
        mdiAccountOutline,
        mdiPencil,
        mdiClose,
        mdiAccountSearchOutline
  }
    }
  }
}
</script>

<style scoped>

</style>
