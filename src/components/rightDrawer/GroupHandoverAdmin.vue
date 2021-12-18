<template>
  <div style="height: 100vh">
    <drawer-top :sub="true" @close="close">
      <v-text-field hide-details rounded dense filled placeholder="搜索">
      </v-text-field>
    </drawer-top>
    <div class="mx-2">
      <v-list nav>
        <v-list-item v-ripple class="im-list-item" v-for="(item,index) of users" :key="index" @click="handoverRoom(item)">
          <v-list-item-avatar>
            <v-img :src="item.avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.username }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {onMounted, ref, watch} from "@vue/composition-api";
import {handoverUserGroup} from "@/net/message";

export default {
  name: "GroupHandoverAdmin",
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

    const handoverRoom = (item) => {
      handoverUserGroup({roomId: props.room.roomId, userId: item._id})
      close()
    }

    const close = () => {
      emit('close', 'GROUP_EDIT')
    }

    return {
      users,
      handoverRoom,
      close
    }
  }
}
</script>

<style scoped>

</style>
