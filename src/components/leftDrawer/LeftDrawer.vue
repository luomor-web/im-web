<template>
  <div>
    <float-menu v-show="!visible" @close="goTo"></float-menu>
    <v-expand-x-transition>
      <div class="im-left-drawer" v-show="visible">
        <setting  v-if="activeSub === 'SETTING'" :curUser="curUser" @close="goTo"></setting>
        <add-chat
            v-else-if="activeSub === 'ADD_CHAT'"
            @close="goTo"/>
        <add-room v-else-if="activeSub === 'CREATE_GROUP'" @close="goTo"/>
      </div>
    </v-expand-x-transition>
  </div>
</template>

<script>
import {ref, watch} from "@vue/composition-api";
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
    FloatMenu
  },
  props: {
    active: {type: String},
  },
  setup(props,{emit}) {

    const activeSub = ref('')
    const visible = ref(false)

    watch(() => props.active, active => {
      console.log(active, 'leftActive')
      activeSub.value = active
      visible.value = !!activeSub.value
    })

    const goTo = item => {
      console.log('left', item)
      activeSub.value = item
      visible.value = !!item
      console.log(activeSub.value, !activeSub.value)
      if(!visible.value) {
        console.log('关闭')
        emit('close')
      }
    }

    return {
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
