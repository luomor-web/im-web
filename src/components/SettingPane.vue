<template>
  <v-expand-x-transition>
    <div v-if="settingPane" class="im-left-drawer">
      <v-window v-model="settingPane" class="fill-height">
        <v-window-item value="SETTING_ITEM">
          <setting-item />
        </v-window-item>
        <v-window-item value="SETTING_USER_PROFILE">
          <setting-user-profile />
        </v-window-item>
        <v-window-item value="SETTING_DOWNLOAD">
          <setting-download />
        </v-window-item>
        <v-window-item value="SETTING_GENERAL">
          <setting-general />
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
import { computed } from '@vue/composition-api'
import store from '@/store'
import { mdiPlus } from '@mdi/js'
import AddRoom from '@/components/settingPane/AddRoom'
import SettingItem from '@/components/settingPane/SettingItem'
import SettingUserProfile from '@/components/settingPane/SettingUserProfile'
import DownloadHistory from '@/components/settingPane/DownloadHistory'
import SettingDownload from '@/components/settingPane/SettingDownload'
import SettingGeneral from '@/components/settingPane/SettingGeneral'

export default {
  name: 'SettingPane',
  components: {
    SettingGeneral,
    SettingDownload,
    AddRoom,
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
