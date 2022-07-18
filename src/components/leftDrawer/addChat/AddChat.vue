<template>
  <div>
    <drawer-top @close="close">
      <v-text-field v-model="searchName"
                    hide-details
                    rounded
                    dense
                    filled
                    clearable
                    @change="search"
                    placeholder="搜索"/>
    </drawer-top>
    <div class="overflow-y-auto fill-height" v-scroll:#scroll-target="onScroll">
      <v-list nav>
        <v-list-item v-ripple v-for="(item,index) of waitSelect" :key="index" >
          <v-list-item-avatar>
            <v-img :src="item.avatar"/>
          </v-list-item-avatar>
          <v-list-item-content @click="clickContent(item)">
            <v-list-item-title>{{ item.username }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="startChat(item)">
              <v-icon>{{ icons.mdiChatOutline }}</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import store from "@/store";
import {mdiChatOutline, mdiMagnify} from "@mdi/js";
import {createGroup, searchUser} from "@/net/send-message";
import {computed, onMounted, ref} from "@vue/composition-api";
import DrawerTop from "@/components/basic/DrawerTop";
import msg from "@/plugins/msg";
import {uuid} from "@/utils/id-util";

export default {
  name: "AddChat",
  components: { DrawerTop},
  setup() {
    const searchName = ref('')
    const waitSelect = ref([])
    const searchId = ref('')
    const loadedRooms = computed(() => store.state.loadedRooms)

    onMounted(() => {
      msg.$on("COMMAND_SEARCH_USER_RESP", onSearchUserResp)
    })

    const search = (item) => {
      if(searchId.value) return
      const userId = waitSelect.value.length > 0 ? waitSelect.value[0]._id : ''
      searchId.value = uuid()
      searchUser(item, userId, searchId.value)
    }

    const onSearchUserResp = (data) => {
      const {searchId: requestId, userList} = data.data
      if (requestId !== searchId.value) return
      waitSelect.value.push(...userList)
      waitSelect.value = [...waitSelect]
      searchId.value = ''
    }

    const startChat = item => {
      const room = loadedRooms.value.find(r => item._id === r.friendId)
      if (!room) {
        createGroup({isFriend: true, roomName: '好友会话', users: [{_id: item._id}]})
        close()
        return
      }
      store.commit('upRoom', room.roomId)
      store.commit('changeRoom', room.roomId)
      close()
    }

    const onScroll = () => {

    }

    const close = () => {
      store.commit('setSettingPane', '')
    }

    return {
      searchName,
      waitSelect,
      startChat,
      close,
      search,

      icons: {
        mdiMagnify,
        mdiChatOutline,
      },
    }
  }
}
</script>

<style lang="scss" scoped>

.no-drag {
  -webkit-app-region: no-drag;
}
</style>
