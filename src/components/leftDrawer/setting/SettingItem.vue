<template>
  <div>
    <drawer-top @close="close" title="设置"></drawer-top>

    <div class="pt-2">
      <div class="mx-2">
        <div class="d-table ma-auto">
          <v-img
              aspect-ratio="1"
              height="120"
              width="120"
              class="header-img"
              :src="curUser.avatar"
          >
          </v-img>
        </div>
        <span class="d-table ma-auto text-h6">{{ curUser.username }}</span>
        <v-list nav>
          <v-list-item v-ripple class="im-list-item" @click="open('USER_PROFILE')">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiPencilOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>资料修改</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <im-driver></im-driver>
        <v-list nav>
          <v-list-item  v-if="isElectron" v-ripple class="im-list-item" @click="open('DOWNLOAD_SETTING')" >
            <v-list-item-icon>
              <v-icon>{{ icons.mdiDownloadOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>下载设置</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {mdiBellOutline, mdiDownloadOutline, mdiPencilOutline} from "@mdi/js";
import ImDriver from "@/components/system/ImDriver";
import {inject, ref} from "@vue/composition-api";

export default {
  name: "SettingItem",
  components: {
    ImDriver,
    DrawerTop
  },
  props: {
    curUser: Object
  },
  setup(props, {emit}) {

    const close = inject('close',() => {})

    const isElectron = ref(process.env.IS_ELECTRON)

    const open = (item) => {
      emit('open', item)
    }

    return {
      open,
      close,
      isElectron,

      icons: {
        mdiPencilOutline,
        mdiBellOutline,
        mdiDownloadOutline,
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
