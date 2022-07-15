<template>
  <div class="fill-height">

    <drawer-top :sub="true" @close="open('GROUP_EDIT')">
      <v-text-field v-model="searchName" hide-details rounded dense filled placeholder="搜索">
      </v-text-field>
    </drawer-top>

    <div class="mx-2 overflow-y-auto fill-height">
      <v-list nav>
        <v-list-item v-ripple v-for="(item,index) of filteredItems" :key="index" @click="startHandoverRoom(item)">
          <v-list-item-avatar>
            <v-img :src="item.avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.username }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>

    <im-warn-dialog :action="action"></im-warn-dialog>

  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {computed, ref} from "@vue/composition-api";
import {handoverUserGroup} from "@/net/send-message";
import ImWarnDialog from "@/components/system/ImWarnDialog";
import store from "@/store";

export default {
  name: "GroupHandoverAdmin",
  components: {
    ImWarnDialog,
    DrawerTop
  },
  setup() {
    const room = computed(() => store.getters.curRoom)
    const curUser = computed(() => store.state.curUser)
    const searchName = ref('')

    // 操作动作
    const action = ref({
      model: false,
      type: '',
      title: '',
      content: '',
      item: null,
      sure: () => {
        switch (action.value.type) {
          case "HANDOVER_ROOM":
            handoverRoom(action.value.item)
            action.value.model = false
            break
        }
      },
      cancel: () => {
        action.value.model = false
      }
    })

    const filteredItems = computed(() => {
      return room.value.users.filter(x => curUser.value._id !== x._id && x.role !== 'ADMIN' && x.username.indexOf(searchName.value) !== -1)
    })

    const startHandoverRoom = item => {
      action.value.model = true
      action.value.title = '移交群聊'
      action.value.content = '您确认移交群组给该成员吗?'
      action.value.type = 'HANDOVER_ROOM'
      action.value.item = item
    }

    const handoverRoom = (item) => {
      handoverUserGroup({roomId: room.value.roomId, userId: item._id})
      store.commit('setInformationPane','ROOM_INFO')
    }

    const open = (item) => {
      store.commit('setInformationPane', item)
    }

    return {
      curUser,
      open,
      filteredItems,
      searchName,
      action,
      startHandoverRoom,
      handoverRoom
    }
  }
}
</script>

<style scoped>

</style>
