<template>
  <div style="height: 100vh">
    <drawer-top :sub="true" @close="close">
      <v-text-field hide-details rounded dense filled placeholder="搜索">
      </v-text-field>
    </drawer-top>
    <div class="mx-2">
      <v-list nav>
        <v-list-item v-ripple :class="curUser._id === item._id? 'd-none':'im-list-item'" v-for="(item,index) of users" :key="index">
          <v-list-item-avatar>
            <v-img :src="item.avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.username }}</v-list-item-title>
          </v-list-item-content>

          <v-list-item-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on">
                  <v-icon>{{ icons.mdiShieldCrownOutline  }}</v-icon>
                </v-btn>
              </template>
              <span>设为管理员</span>
            </v-tooltip>
          </v-list-item-icon>

          <v-list-item-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on"
                       @click="removeRoom(item)">
                  <v-icon>{{ icons.mdiExitToApp  }}</v-icon>
                </v-btn>
              </template>
              <span>移出群聊</span>
            </v-tooltip>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>
<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {onMounted, ref, watch} from "@vue/composition-api";
import {mdiAccountCogOutline, mdiAccountRemoveOutline, mdiExitToApp, mdiShieldCrownOutline} from "@mdi/js";
import {removeUserGroup} from "@/net/message";
import {curUser} from "@/views/home/home";

export default {

  name: "GroupUserManage",
  components: {
    DrawerTop
  },
  props: {
    room: {type: Object}
  },
  setup(props, {emit}) {

    const users = ref([])

    watch(() => props.room, room => {
      users.value = room.users
    })

    onMounted(() => {
      users.value = props.room.users
    })


    const removeRoom = (item) => {
      removeUserGroup({roomId: props.room.roomId, userId: item._id, type: 'REMOVE'})
    }


    const close = () => {
      emit('close', 'GROUP_EDIT')
    }

    return {
      curUser,
      users,
      removeRoom,
      close,

      icons: {
        mdiAccountCogOutline,
        mdiAccountRemoveOutline,
        mdiShieldCrownOutline,
        mdiExitToApp
      }
    }
  }
}
</script>

<style scoped>

</style>
