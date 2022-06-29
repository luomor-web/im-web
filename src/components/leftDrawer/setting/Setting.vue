<template>
    <v-window v-model="active" class="setting-window">
      <v-window-item value="SETTING_ITEM">
        <setting-item :curUser="curUser" @open="open"></setting-item>
      </v-window-item>
      <v-window-item value="USER_PROFILE">
        <user-profile :user="curUser" @open="open"></user-profile>
      </v-window-item>
      <v-window-item value="DOWNLOAD_SETTING">
        <download-setting :user="curUser" @open="open"></download-setting>
      </v-window-item>
      <v-window-item value="D">
<!--        <download-setting :user="curUser" @open="open"></download-setting>-->
      </v-window-item>
    </v-window>
</template>

<script>

import {ref} from "@vue/composition-api";
import SettingItem from "@/components/leftDrawer/setting/SettingItem";
import UserProfile from "@/components/leftDrawer/setting/UserProfile";
import DownloadSetting from "@/components/leftDrawer/setting/DownloadSetting";

export default {
  name: "Setting",
  components: {
    DownloadSetting,
    UserProfile,
    SettingItem
  },
  props:{
    curUser: Object
  },
  setup() {
    const active = ref('')

    const open = item => {
      active.value = item
    }

    return {
      open,
      close,
      active
    }
  }
}
</script>

<style scoped>
.setting-window {
  height: 100%;
}
</style>
