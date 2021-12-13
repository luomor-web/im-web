<template>
  <div>
    <drawer-top @close="closeAddRoom">
      <template #default>
        <user-search></user-search>
      </template>
      <template #right>
        <div v-if="userSelect.length > 0">
          <v-spacer></v-spacer>
          <v-btn icon @click="toGo('GROUP_SETTING')">
            <v-icon>{{ icons.mdiArrowRight }}</v-icon>
          </v-btn>
        </div>
      </template>
    </drawer-top>
    <div>
      <div class="ma-2">
        <v-chip v-for="(item,index) of userSelect" :key="index" @click="removeUser(item)" class="ma-1">
          {{ item.username }}
          <v-avatar right>
            <v-img :src="item.avatar"></v-img>
          </v-avatar>
        </v-chip>
      </div>
      <im-driver v-if="userSelect.length > 0"></im-driver>
      <user-select-column @click-content="operationUser">
        <div slot="userAction" slot-scope="{item}">
          <v-btn @click="operationUser(item)" :color="isInclude(item) ? 'error':'primary'">
            {{ isInclude(item) ? '移除' : '添加' }}
          </v-btn>
        </div>
      </user-select-column>
    </div>
  </div>
</template>

<script>
import UserSearch from "@/components/user/UserSearch";
import ImDriver from "@/components/system/ImDriver";
import UserSelectColumn from "@/components/user/UserSelectColumn";
import DrawerTop from "@/components/drawer/DrawerTop";
import {ref} from "@vue/composition-api";
import {mdiArrowRight} from "@mdi/js";

export default {
  name: "AddRoomSelectUser",

  components: {
    UserSearch,
    ImDriver,
    UserSelectColumn,
    DrawerTop
  },
  setup(props, {emit}) {

    const userSelect = ref([])

    const removeUser = (item) => {
      const index = userSelect.value.findIndex(r => r._id === item._id);
      userSelect.value.splice(index, 1)
    }

    const operationUser = item => {
      const index = findUserSelect(item);
      if (index !== -1) {
        userSelect.value.splice(index, 1)
        return
      }
      userSelect.value.push(item)
    }

    const isInclude = (item) => {
      return findUserSelect(item) !== -1
    }

    const findUserSelect = (item) => {
      return userSelect.value.findIndex(r => r._id === item._id)
    }

    const closeAddRoom = () => {
      emit('close')
    }

    const toGo = item => {
      emit('to-go', item,userSelect.value)
    }

    return {
      userSelect,
      toGo,
      isInclude,
      removeUser,
      operationUser,
      closeAddRoom,

      icons: {
        mdiArrowRight
      }
    }
  }
}
</script>

<style scoped>

</style>