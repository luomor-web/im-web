<template>
  <div>
    <float-menu v-show="!visible" @close="goTo"></float-menu>
    <v-slide-x-transition>
      <div class="im-left-drawer" v-show="visible">
        <user-profile v-if="activeSub === 'USER_PROFILE'" :user="curUser" @close="goTo"/>
        <add-chat
            v-else-if="activeSub === 'ADD_CHAT'"
            @close="goTo"/>
        <add-room v-else-if="activeSub === 'CREATE_GROUP'" @close="goTo"/>
      </div>
    </v-slide-x-transition>
  </div>
</template>

<script>
import {ref, watch} from "@vue/composition-api";
import UserProfile from "@/components/leftDrawer/UserProfile";
import {curUser, loadedRooms} from "@/views/home/home";
import {mdiPlus} from "@mdi/js";
import FloatMenu from "@/components/leftDrawer/FloatMenu";
import AddChat from "@/components/leftDrawer/AddChat";
import AddRoom from "@/components/leftDrawer/AddRoom";

export default {
  name: "LeftDrawer",
  components: {AddRoom, AddChat, FloatMenu, UserProfile},
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
