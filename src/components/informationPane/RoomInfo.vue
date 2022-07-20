<template>
  <div class="fill-height">
    <drawer-top
      :title="'资料'"
      @close="close">
      <template #right>
        <v-spacer/>
        <v-btn class="no-drag" icon @click="open('GROUP_EDIT')" v-if="isGroup">
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
          />
        </div>
        <span class="d-table ma-auto text-h6">{{ room.roomName }}</span>
        <v-list nav>
          <v-list-item v-ripple class="im-list-item">
            <v-list-item-icon>
              <v-icon>{{ room.notice ? icons.mdiBellOutline : icons.mdiBellOffOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>通知</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="notice" @change="noticeChange"/>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </div>

    <im-driver/>
    <div v-if="isGroup" style="height: calc(100% - 308px)" class="overflow-y-auto">
      <div class="mx-2">
        <v-list nav>
          <v-list-item v-for="(item,index) in room.users" :key="index" v-ripple class="im-list-item">
            <v-list-item-avatar>
              <v-img :src="item.avatar"/>
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
      <div>
        <v-btn
          transition="scroll-x-reverse-transition"
          class="mr-8 mb-16"
          color="primary"
          dark
          absolute
          bottom
          right
          fab
          @click="userSelectModel = true"
        >
          <v-icon>{{ icons.mdiPlus }}</v-icon>
        </v-btn>
      </div>
    </div>
    <im-user-select-dialog :model="userSelectModel" @sure="sureInviteUser" @cancel="userSelectModel = false" multiple/>
  </div>
</template>

<script>
import {joinUserGroup, userGroupConfig} from "@/net/send-message";
import {mdiBellOffOutline, mdiBellOutline, mdiPencilOutline, mdiPlus} from "@mdi/js";
import DrawerTop from "@/components/basic/DrawerTop";
import ImDriver from "@/components/basic/ImDriver";
import {computed, onMounted, ref, watch} from "@vue/composition-api";
import store from "@/store";
import ImUserSelectDialog from "@/components/basic/ImUserSelectDialog";

export default {
  name: "RoomInfo",
  components: {
    ImDriver,
    DrawerTop,
    ImUserSelectDialog
  },
  setup(props, context) {

    const room = computed(() => store.getters.curRoom)
    const isGroup = computed(() => !room.value.isFriend && !room.value.isSystem)
    const userSelectModel = ref(false)

    const close = () => {
      store.commit('setInformationPane', '')
    }

    const open = (item) => {
      store.commit('setInformationPane', item)
    }

    const notice = ref(true)

    watch(room, room => {
      notice.value = room.notice
    })

    onMounted(() => {
      notice.value = room.value.notice
    })

    const noticeChange = item => {
      const param = {
        roomId: room.value.roomId,
        notice: item,
        type: 'NOTICE'
      }
      userGroupConfig(param)
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
        roomId: room.value.roomId
      }
      joinUserGroup({group, users})
    }

    const sureInviteUser = (data) => {
      const {users} = data
      if (!users) return

      const filter = users.filter(r => room.value.users.findIndex(x => x._id === r._id) === -1);
      joinGroup(filter)
      userSelectModel.value = false
    }

    return {
      userSelectModel,
      room,
      notice,
      isGroup,
      open,
      close,
      noticeChange,
      sureInviteUser,
      joinGroup,
      startChat,

      icons: {
        mdiBellOutline,
        mdiBellOffOutline,
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
