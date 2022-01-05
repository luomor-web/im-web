<template>
  <div class="fill-height">

    <drawer-top :sub="true" @close="close">
      <v-text-field v-model="searchName" hide-details rounded dense filled placeholder="搜索">
      </v-text-field>
    </drawer-top>

    <div class="mx-2 overflow-y-auto" style="height: calc(100vh - 64px)">
      <v-list nav>
        <v-list-item v-ripple  v-for="(item,index) of filteredItems" :key="index" @click="startHandoverRoom(item)">
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
import {handoverUserGroup} from "@/net/message";
import ImWarnDialog from "@/components/system/ImWarnDialog";
import {curUser} from "@/views/home/home";

export default {
  name: "GroupHandoverAdmin",
  components: {
    ImWarnDialog,
    DrawerTop
  },
  props: {
    room: {type: Object}
  },
  setup(props, {emit}) {

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
      return props.room.users.filter(x => curUser.value._id !== x._id && x.role !== 'ADMIN' && x.username.indexOf(searchName.value) !== -1)
    })

    const startHandoverRoom = item => {
      action.value.model = true
      action.value.title = '移交群聊'
      action.value.content = '您确认移交群组给该成员吗?'
      action.value.type = 'HANDOVER_ROOM'
      action.value.item = item
    }

    const handoverRoom = (item) => {
      handoverUserGroup({roomId: props.room.roomId, userId: item._id})
      close()
    }

    const close = () => {
      emit('close', 'GROUP_EDIT')
    }

    return {
      curUser,
      filteredItems,
      searchName,
      action,
      startHandoverRoom,
      handoverRoom,
      close
    }
  }
}
</script>

<style scoped>

</style>
