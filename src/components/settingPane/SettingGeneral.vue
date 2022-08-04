<template>
  <div class="fill-height">
    <drawer-top :title="'通用设置'" :sub="true" @close="open('SETTING_ITEM')" />

    <v-list nav>
      <v-list-item v-ripple class="im-list-item">
        <v-list-item-content>
          <v-list-item-title>开机自启</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-switch
              v-model="autoStart"
              @change="autoStartChange"
          />
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import DrawerTop from '@/components/basic/DrawerTop'
import { computed, onMounted, ref, watch } from '@vue/composition-api'
import { mdiCheck, mdiFolderOutline, mdiHelp } from '@mdi/js'
import store from '@/store'

export default {
  name: 'SettingGeneral',
  components: {
    DrawerTop
  },
  setup() {
    const autoStart = ref(false)
    const autoStartStore = computed(() => store.state.autoStart)

    onMounted(() => {
      autoStart.value = autoStartStore.value
    })

    watch(autoStartStore, () => {
      autoStart.value = autoStartStore.value
    })

    const autoStartChange = (item) => {
      if (process.env.NODE_ENV !== 'production' && item) {
        console.log('开发者模式下设置无效，代码强行阻断，可能导致意料之外的问题')
        return
      }
      store.commit('setAutoStart', item)
      window.require('electron').ipcRenderer.send('open-auto-start', item)
    }

    const open = (item) => {
      store.commit('setSettingPane', item)
    }

    return {
      open,
      autoStart,
      autoStartChange,

      icons: {
        mdiCheck,
        mdiFolderOutline,
        mdiHelp
      }
    }
  }
}
</script>

<style scoped>

</style>
