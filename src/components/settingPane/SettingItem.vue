<template>
  <div>
    <drawer-top title="设置" @close="close" />
    <div class="pt-2">
      <div class="mx-2">
        <div class="d-table ma-auto">
          <v-img
              aspect-ratio="1"
              height="120"
              width="120"
              class="header-img"
              :src="curUser.avatar"
          />
        </div>
        <span class="d-table ma-auto text-h6">{{ curUser.username }}</span>
        <v-list nav>
          <v-list-item v-ripple class="im-list-item" @click="open('SETTING_USER_PROFILE')">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiPencilOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>资料修改</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-ripple class="im-list-item" @click="open('SETTING_PASSWORD')">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiLockCheckOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>修改密码</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <im-driver />
        <v-list nav>
          <v-list-item v-if="isElectron" v-ripple class="im-list-item" @click="open('SETTING_DOWNLOAD')">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiFileArrowUpDownOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>下载设置</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="isElectron" v-ripple class="im-list-item" @click="open('SETTING_GENERAL')">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiStoreCogOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>通用设置</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-ripple class="im-list-item" @click="open('SETTING_VIDEO')">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiVideoOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>视频通话</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </div>
</template>

<script>
import DrawerTop from '@/components/basic/DrawerTop'
import {
  mdiBellOutline,
  mdiFileArrowUpDownOutline, mdiLockCheckOutline,
  mdiPencilOutline,
  mdiStoreCogOutline,
  mdiVideoOutline
} from '@mdi/js'
import ImDriver from '@/components/basic/ImDriver'
import { computed, onMounted, ref } from '@vue/composition-api'
import store from '@/store'
import { getDeviceList, getMediaPower } from '@/components/basic/openvidu/OpenVidu'

export default {
  name: 'SettingItem',
  components: {
    ImDriver,
    DrawerTop
  },
  setup() {
    const isElectron = ref(process.env.IS_ELECTRON)
    const curUser = computed(() => store.state.curUser)

    onMounted(async () => {
      const devices = await getDeviceList()
      const filter = devices.filter(x => (x.kind === 'audioinput' || x.kind === 'videoinput') && x.label)
      if (filter.length === 0) {
        console.log(filter, 'filter')
        await getMediaPower()
      }
    })

    const open = (item) => {
      store.commit('setSettingPane', item)
    }

    const close = () => {
      store.commit('setSettingPane', '')
    }

    return {
      open,
      close,
      curUser,
      isElectron,

      icons: {
        mdiPencilOutline,
        mdiBellOutline,
        mdiStoreCogOutline,
        mdiFileArrowUpDownOutline,
        mdiVideoOutline,
        mdiLockCheckOutline
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
