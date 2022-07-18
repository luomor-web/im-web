<template>
  <v-expand-x-transition>
    <div class="im-left-drawer" v-if="settingPane">
      <v-window v-model="settingPane"  class="fill-height">
        <v-window-item value="SETTING_ITEM">
          <setting-item />
        </v-window-item>
        <v-window-item value="SETTING_USER_PROFILE">
          <setting-user-profile />
        </v-window-item>
        <v-window-item value="SETTING_DOWNLOAD">
          <setting-download />
        </v-window-item>
        <v-window-item value="ADD_CHAT">
          <add-chat />
        </v-window-item>
        <v-window-item value="CREATE_GROUP">
          <add-room />
        </v-window-item>
        <v-window-item value="DOWNLOAD_HISTORY">
          <download-history />
        </v-window-item>
      </v-window>
    </div>
  </v-expand-x-transition>
</template>

<script>
import {computed} from "@vue/composition-api";
import store from "@/store";
import {mdiPlus} from "@mdi/js";
import AddChat from "@/components/leftDrawer/addChat/AddChat";
import AddRoom from "@/components/leftDrawer/addRoom/AddRoom";
import SettingItem from "@/components/leftDrawer/setting/SettingItem";
import SettingUserProfile from "@/components/leftDrawer/setting/SettingUserProfile";
import DownloadHistory from "@/components/leftDrawer/downloadHistory/DownloadHistory";
import SettingDownload from "@/components/leftDrawer/setting/SettingDownload";

export default {
  name: "SettingPane",
  components: {
    SettingDownload,
    AddRoom,
    AddChat,
    DownloadHistory,
    SettingItem,
    SettingUserProfile
  },
  setup() {
    const curUser = computed(() => store.state.curUser)
    const settingPane = computed(() => store.state.settingPane)


    return {
      settingPane,
      curUser,

      icons: {
        mdiPlus
      }
    }

  }
}
</script>

<style lang="scss" scoped>

.im-left-drawer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
  background-color: white;
}

</style>
