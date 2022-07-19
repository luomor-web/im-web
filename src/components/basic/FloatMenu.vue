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
          <v-list-item class="im-list-item" @click="open('CREATE_GROUP')">
            <v-list-item-icon>
              <v-icon>
                {{ icons.mdiAccountSupervisorOutline }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              创建群组
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
    <im-user-select-dialog :model="addChat" @cancel="closeAddChat" @sure="sureAddChat"/>
  </div>
</template>

<script>
import {computed, ref} from "@vue/composition-api";
import {mdiAccountOutline, mdiAccountSupervisorOutline, mdiClose, mdiPencil} from "@mdi/js";
import ImUserSelectDialog from "@/components/basic/ImUserSelectDialog";
import {createGroup} from "@/net/send-message";
import store from "@/store";

export default {
  name: "FloatMenu",
  components: {ImUserSelectDialog},
  setup() {
    const fab = ref(false)
    const addChat = ref(false)
    const loadedRooms = computed(() => store.state.loadedRooms)

    const openAddChat = () => {
      addChat.value = true
      fab.value = false
    }

    const closeAddChat = () => {
      addChat.value = false
    }

    const sureAddChat = (item) => {
      addChat.value = false
      console.log(item)
      const room = loadedRooms.value.find(r => item._id === r.friendId)
      if (!room) {
        createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
        return
      }
      store.commit('upRoom', room.roomId)
      store.commit('changeRoom', room.roomId)
    }

    return {
      fab,
      addChat,
      openAddChat,
      closeAddChat,
      sureAddChat,

      icons: {
        mdiAccountSupervisorOutline,
        mdiAccountOutline,
        mdiPencil,
        mdiClose,
      }
    }

  }
}
</script>

<style scoped>

</style>
