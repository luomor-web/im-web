<template>
  <div>
    <drawer-top
        :title="'资料'"
        @close="close">
      <template #right>
        <v-spacer></v-spacer>
        <v-btn class="no-drag" icon @click="edit">
          <v-icon>
            {{ icons.mdiPencilOutline }}
          </v-icon>
        </v-btn>
      </template>
    </drawer-top>

    <div class="pt-2">
      <div class="mx-2">
        <div class="d-table ma-auto">
          <v-img
              aspect-ratio="1"
              height="120"
              width="120"
              class="header-img"
              :src="room.avatar"
          >
          </v-img>
        </div>
        <span class="d-table ma-auto text-h6">{{ room.roomName }}</span>
        <v-list nav>
          <v-list-item v-ripple class="im-list-item">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiBellOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>通知</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch
              ></v-switch>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </div>

    <im-driver></im-driver>

    <div class="mx-2" style="height: calc(100vh - 296px)">
      <v-list nav>
        <v-list-item v-for="(item,index) in room.users" :key="index" v-ripple class="im-list-item">
          <v-list-item-avatar>
            <v-img :src="item.avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.username }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>

    <v-fab-transition>
      <v-btn
          class="mr-8 mb-16"
          color="primary"
          dark
          absolute
          bottom
          right
          fab
      >
        <v-icon>{{icons.mdiPlus}}</v-icon>
      </v-btn>
    </v-fab-transition>
  </div>
</template>

<script>
import {ref} from "@vue/composition-api";
import {disbandGroup, handoverUserGroup, joinUserGroup, removeUserGroup} from "@/net/message";
import {mdiBellOutline, mdiPencilOutline, mdiPlus} from "@mdi/js";
import DrawerTop from "@/components/drawer/DrawerTop";
import ImDriver from "@/components/system/ImDriver";

export default {
  name: "GroupInfo",
  props: {
    visible: Boolean,
    room: Object
  },
  components: {
    ImDriver,
    DrawerTop,
  },
  setup(props, context) {

    const action = ref({
      removeAction: false,
      outAction: false,
      handoverAction: false,
      disbandAction: false
    })

    const resetActionData = (timeout) => {
      setTimeout(() => {
        action.value = {
          removeAction: false,
          outAction: false,
          handoverAction: false,
          disbandAction: false
        }
      }, timeout)
    }

    const clickSureButton = (item) => {
      if (action.value.handoverAction || action.value.removeAction || action.value.disbandAction || action.value.outAction) {
        action.value = {
          removeAction: false,
          outAction: false,
          handoverAction: false,
          disbandAction: false
        }
      }
      action.value[item] = true
    }

    const closeGroupInfo = () => {
      context.emit('close')
    }

    const removeRoom = (item) => {
      action.value.removeAction = false
      removeUserGroup({roomId: props.room.roomId, userId: item._id, type: 'REMOVE'})
    }

    const outRoom = (item) => {
      action.value.outAction = false
      removeUserGroup({roomId: props.room.roomId, userId: item._id, type: 'OUT'})
      closeGroupInfo()
    }

    const handoverRoom = (item) => {
      action.value.handoverAction = false
      handoverUserGroup({roomId: props.room.roomId, userId: item._id})
    }

    const disbandRoom = () => {
      action.value.disbandAction = false
      disbandGroup({roomId: props.room.roomId})
      closeGroupInfo()
    }

    const startChat = (item) => {
      context.emit('chat', item)
    }


    const joinGroup = (items) => {
      const users = items.map(x => {
        return {
          _id: x._id
        }
      })
      const group = {
        roomId: props.room.roomId
      }
      joinUserGroup({group, users})
    }

    const edit = () => {
      context.emit('edit')
    }

    const close = () => {
      context.emit('close')
    }

    return {
      close,
      edit,
      joinGroup,
      clickSureButton,
      outRoom,
      resetActionData,
      handoverRoom,
      disbandRoom,
      closeGroupInfo,
      removeRoom,
      startChat,

      icons: {
        mdiBellOutline,
        mdiPencilOutline,
        mdiPlus,
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@import "src/styles/theme";

.header-img {
  border-radius: 120px;
  background-color: $v-grey-lighten1;
}


</style>
