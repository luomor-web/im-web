<template>
  <div>
    <drawer-top
        :title="'资料'"
        @close="close">
      <template #right>
        <v-spacer></v-spacer>
        <v-btn class="no-drag" icon @click="close('GROUP_EDIT')">
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

    <div class="mx-2 overflow-y-auto" style="height: calc(100vh - 296px)">
      <v-list nav>
        <v-list-item v-for="(item,index) in room.users" :key="index" v-ripple class="im-list-item">
          <v-list-item-avatar>
            <v-img :src="item.avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-badge
                :color="item.status.state === 'online' ? 'green': 'grey'"
                inline
                left
                dot
            >
              <v-list-item-title>{{ item.username }}</v-list-item-title>
            </v-badge>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn :color="item.role ==='ADMIN' ? 'warning': item.role==='GENERAL' ? 'success': 'primary'" small>
              {{ item.role === 'ADMIN' ? '群主' : item.role === 'GENERAL' ? '成员' : '管理员' }}
            </v-btn>
          </v-list-item-action>
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
          @click="close('GROUP_INVITE_USER')"
      >
        <v-icon>{{ icons.mdiPlus }}</v-icon>
      </v-btn>
    </v-fab-transition>
  </div>
</template>

<script>
import {joinUserGroup} from "@/net/message";
import {mdiBellOutline, mdiPencilOutline, mdiPlus} from "@mdi/js";
import DrawerTop from "@/components/drawer/DrawerTop";
import ImDriver from "@/components/system/ImDriver";

export default {
  name: "GroupInfo",
  props: {
    room: Object
  },
  components: {
    ImDriver,
    DrawerTop,
  },
  setup(props, context) {

    const closeGroupInfo = () => {
      context.emit('close')
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

    const close = item => {
      context.emit('close', item)
    }

    return {
      close,
      joinGroup,
      closeGroupInfo,
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
