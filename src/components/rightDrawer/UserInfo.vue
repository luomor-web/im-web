<template>
  <div>
    <drawer-top
        :title="'资料'"
        @close="close">
    </drawer-top>

    <div class="pt-2">
      <div class="mx-2">
        <div class="d-table ma-auto">
          <v-img
              aspect-ratio="1"
              height="120"
              width="120"
              class="header-img"
              :src="room.avatar"
          >
          </v-img>
        </div>
        <span class="d-table ma-auto text-h6">{{ room.roomName }}</span>
        <v-list nav>
          <v-list-item v-ripple class="im-list-item">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiBellOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>通知</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch
              ></v-switch>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </div>

    <im-driver></im-driver>

  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import ImDriver from "@/components/system/ImDriver";
import {ref} from "@vue/composition-api";
import {mdiBellOutline, mdiPencilOutline} from "@mdi/js";

export default {
  name: "UserInfo",
  props: {
    visible: Boolean,
    room: Object
  },
  components: {
    DrawerTop,
    ImDriver
  },
  setup(props, {emit}) {
    const drawerTemporary = ref(true)

    const changeUserProfile = () => {

    }

    const close = () => {
      emit('close')
    }
    return {
      drawerTemporary,
      close,
      changeUserProfile,

      icons : {
        mdiPencilOutline,
        mdiBellOutline,
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@import "src/styles/theme";

.header-img {
  border-radius: 120px;
  background-color: $v-grey-lighten1;
}


</style>
