<template>
  <div>
    <drawer-top @close="close" :sub="true">
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
import UserSelectColumn from "@/components/user/UserSelectColumn";
import UserSearch from "@/components/user/UserSearch";
import DrawerTop from "@/components/drawer/DrawerTop";
import ImDriver from "@/components/system/ImDriver";
import {ref} from "@vue/composition-api";

export default {
  name: "GroupInviteUser",
  components: {UserSelectColumn, DrawerTop, UserSearch, ImDriver},

  setup() {
    const userSelect = ref([])

    return {
      userSelect
    }
  }
}
</script>

<style scoped>

</style>