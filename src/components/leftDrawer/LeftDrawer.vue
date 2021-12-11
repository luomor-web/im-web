<template>
  <div>
    <float-menu v-show="!visible" @close="goTo">
    </float-menu>
    <v-expand-x-transition>
      <div class="im-left-drawer" v-show="visible">
        <v-window v-model="activeSub" style="height: 100% ">
          <v-window-item value="USER_PROFILE">
            <user-profile :user="curUser" @close="goTo"></user-profile>
          </v-window-item>
          <v-window-item value="ADD_CHAT">
            <add-chat @close="goTo"></add-chat>
          </v-window-item>
          <v-window-item value="CREATE_GROUP">
            <add-room @close="goTo"></add-room>
          </v-window-item>
        </v-window>
      </div>
    </v-expand-x-transition>
  </div>
</template>

<script>
import {ref, watch} from "@vue/composition-api";
import UserProfile from "@/components/leftDrawer/UserProfile";
import {curUser} from "@/views/home/home";
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
  setup(props) {

    const activeSub = ref('')
    const visible = ref(false)

    watch(() => props.active, active => {
      console.log(active, 'leftActive')
      activeSub.value = active
      visible.value = !!activeSub.value
    })

    const goTo = item => {
      console.log('left', item)
      visible.value = !!item
      activeSub.value = item
      console.log(activeSub.value, !activeSub.value)
    }


    return {
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
