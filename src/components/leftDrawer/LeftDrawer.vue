<template>
  <div>
    <float-menu v-show="!visible"></float-menu>
    <v-expand-x-transition>
      <div class="im-left-drawer" v-show="visible">
        <setting v-if="active === 'SETTING'" :curUser="curUser" @close="goTo"></setting>
        <add-chat v-else-if="active === 'ADD_CHAT'" @close="goTo"/>
        <add-room v-else-if="active === 'CREATE_GROUP'" @close="goTo"/>
        <download-history v-else-if="active === 'DOWNLOAD_HISTORY'" @close="goTo"/>
      </div>
    </v-expand-x-transition>
  </div>
</template>

<script>
import DownloadHistory from "@/components/leftDrawer/downloadHistory/DownloadHistory";
import {provide, ref} from "@vue/composition-api";
import {curUser, loadedRooms} from "@/views/home/home";
import {mdiPlus} from "@mdi/js";
import FloatMenu from "@/components/leftDrawer/FloatMenu";
import AddChat from "@/components/leftDrawer/addChat/AddChat";
import AddRoom from "@/components/leftDrawer/addRoom/AddRoom";
import Setting from "@/components/leftDrawer/setting/Setting";

export default {
  name: "LeftDrawer",
  components: {
    Setting,
    AddRoom,
    AddChat,
    FloatMenu,
    DownloadHistory
  },
  setup(props, {emit}) {

    const active = ref('')
    const visible = ref(false)

    const open = (item) => {
      active.value = item
      visible.value = true
    }
    provide('open', open)

    const close = () => {
      active.value = ''
      visible.value = false
    }
    provide('close', close)

    const activeSub = ref('')

    const goTo = item => {
      activeSub.value = item
      visible.value = !!item
      if (!visible.value) {
        emit('close')
      }
    }

    return {
      active,
      open,
      close,

      loadedRooms,
      visible,
      curUser,
      activeSub,
      goTo,

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
