<template>
  <div>
    <float-menu v-show="!visible"></float-menu>
    <v-expand-x-transition>
      <div class="im-left-drawer" v-show="visible">
        <v-window v-model="activeSub" style="height: 100% ">
          <v-window-item value="USER_PROFILE">
            <user-profile :user="curUser" @close="goTo"></user-profile>
          </v-window-item>
          <v-window-item value="GROUP_EDIT">

          </v-window-item>
          <v-window-item value="GROUP_USER_MANAGE">

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

export default {
  name: "LeftDrawer",
  components: {FloatMenu, UserProfile},
  props: {
    active: {type: String},
    visible: {type: Boolean},
  },
  setup(props, {emit}) {

    const activeSub = ref('')

    watch(() => props.active, active => {
      console.log(active, 'leftActive')
      activeSub.value = active
    })

    const goTo = item => {
      if (!item) close()
      activeSub.value = item
    }

    const close = () => {
      emit('close')
    }

    return {
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
