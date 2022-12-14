<template>
  <div class="fill-height">
    <drawer-top :sub="true" @close="open('GROUP_EDIT')">
      <v-text-field v-model="searchName" hide-details rounded dense filled placeholder="搜索" />
    </drawer-top>
    <div class="mx-2 overflow-y-auto " style="height: calc(100% - 64px)">
      <v-list nav>
        <v-list-item v-for="(item,index) of filteredItems" :key="index" v-ripple
                     class="im-list-item"
>
          <v-list-item-avatar>
            <v-img :src="item.avatar" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.username }}</v-list-item-title>
          </v-list-item-content>

          <v-list-item-icon v-if="item.role === 'GENERAL'">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on"
                       @click="startSetRoomAdmin(item)"
>
                  <v-icon>{{ icons.mdiShieldLockOutline }}</v-icon>
                </v-btn>
              </template>
              <span>设为管理员</span>
            </v-tooltip>
          </v-list-item-icon>

          <v-list-item-icon v-if="item.role === 'SUB_ADMIN'">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on"
                       @click="startUnSetRoomAdmin(item)"
>
                  <v-icon>{{ icons.mdiShieldLockOpenOutline }}</v-icon>
                </v-btn>
              </template>
              <span>解除管理员</span>
            </v-tooltip>
          </v-list-item-icon>

          <v-list-item-icon>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on"
                       @click="startRemoveRoom(item)"
>
                  <v-icon>{{ icons.mdiExitToApp }}</v-icon>
                </v-btn>
              </template>
              <span>移出群聊</span>
            </v-tooltip>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
    </div>

    <im-warn-dialog :action="action" />
  </div>
</template>
<script>
import DrawerTop from '@/components/basic/DrawerTop'
import { computed, ref } from '@vue/composition-api'
import { mdiExitToApp, mdiShieldCrownOutline, mdiShieldLockOpenOutline, mdiShieldLockOutline } from '@mdi/js'
import { removeUserGroup, setAdmin } from '@/net/send-message'
import ImWarnDialog from '@/components/basic/ImWarnDialog'
import store from '@/store'

export default {
  name: 'GroupUserManage',
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
          case 'REMOVE_ROOM':
            removeRoom(action.value.item)
            action.value.model = false
            break
          case 'SET_ROOM_ADMIN':
            setRoomAdmin(action.value.item)
            action.value.model = false
            break
          case 'UN_SET_ROOM_ADMIN':
            unSetRoomAdmin(action.value.item)
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

    // 点击退出群组按钮, 主要强调弹出过程
    const startRemoveRoom = item => {
      action.value.model = true
      action.value.title = '移出群聊'
      action.value.content = '您确认将该成员移出群组吗?'
      action.value.type = 'REMOVE_ROOM'
      action.value.item = item
    }

    const removeRoom = item => {
      removeUserGroup({ roomId: room.value.roomId, userId: item._id, type: 'REMOVE' })
    }

    // 点击退出群组按钮, 主要强调弹出过程
    const startSetRoomAdmin = item => {
      action.value.model = true
      action.value.title = '设为管理员'
      action.value.content = '您确认将该成员设为管理员吗?'
      action.value.type = 'SET_ROOM_ADMIN'
      action.value.item = item
    }

    const setRoomAdmin = (item) => {
      setAdmin({ roomId: room.value.roomId, userId: item._id, type: 'SET' })
    }

    // 点击退出群组按钮, 主要强调弹出过程
    const startUnSetRoomAdmin = item => {
      action.value.model = true
      action.value.title = '解除管理员'
      action.value.content = '您确认解除该成员的管理员身份吗?'
      action.value.type = 'UN_SET_ROOM_ADMIN'
      action.value.item = item
    }

    const unSetRoomAdmin = (item) => {
      setAdmin({ roomId: room.value.roomId, userId: item._id, type: 'UN_SET' })
    }

    const open = (item) => {
      store.commit('setInformationPane', item)
    }

    return {
      curUser,
      open,
      action,
      searchName,
      filteredItems,
      startRemoveRoom,
      removeRoom,
      startSetRoomAdmin,
      setRoomAdmin,
      startUnSetRoomAdmin,
      unSetRoomAdmin,

      icons: {
        mdiShieldLockOutline,
        mdiShieldLockOpenOutline,
        mdiShieldCrownOutline,
        mdiExitToApp
      }
    }
  }
}
</script>

<style scoped>

</style>
