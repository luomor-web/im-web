<template>
  <div class="fill-height">

    <drawer-top :sub="true" @close="close">
      <v-text-field hide-details rounded dense filled placeholder="搜索">
      </v-text-field>
    </drawer-top>

    <div class="mx-2">
      <v-list nav>
        <v-list-item v-ripple :class="curUser._id === item._id? 'd-none':'im-list-item'" v-for="(item,index) of room.users" :key="index" @click="startHandoverRoom(item)">
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
import {ref} from "@vue/composition-api";
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
