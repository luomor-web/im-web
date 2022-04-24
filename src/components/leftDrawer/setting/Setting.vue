<template>
  <div :style="{height: pageHeight}">
    <v-window v-model="active">
      <v-window-item value="SETTING_ITEM">
        <setting-item :curUser="curUser" @open="open"></setting-item>
      </v-window-item>
      <v-window-item value="USER_PROFILE">
        <user-profile :user="curUser" @open="open"></user-profile>
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
  setup() {
    const pageHeight = process.env.isElectron ? "calc(100vh  - 32px)" : "100vh"
    const active = ref('')

    const open = item => {
      active.value = item
    }

    return {
      pageHeight,
      open,
      close,
      active
    }
  }
}
</script>

<style scoped>

</style>
