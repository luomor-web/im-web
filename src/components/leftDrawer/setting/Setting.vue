<template>
  <div style="height: 100vh">
    <v-window v-model="active">
      <v-window-item value="SETTING_ITEM">
        <setting-item :curUser="curUser" @close="close"></setting-item>
      </v-window-item>
      <v-window-item value="USER_PROFILE">
        <user-profile :user="curUser" @close="close"></user-profile>
      </v-window-item>
    </v-window>
  </div>
</template>

<script>

import {ref} from "@vue/composition-api";
import SettingItem from "@/components/leftDrawer/setting/SettingItem";
import UserProfile from "@/components/leftDrawer/setting/UserProfile";

export default {
  name: "Setting",
  components: {
    UserProfile,
    SettingItem
  },
  props:{
    curUser: Object
  },
  setup(props, {emit}) {
    const active = ref('')

    const close = item => {
      console.log('嫦娥',item)
      if(item){
        active.value = item
        return
      }
      emit('close')
    }

    return {
      close,
      active
    }
  }
}
</script>

<style scoped>

</style>