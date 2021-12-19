<template>
  <div>
    <drawer-top @close="close">
      <template #default>
        <v-text-field hide-details rounded dense filled placeholder="搜索">
        </v-text-field>
      </template>
      <template #right>
        <v-btn icon>
          <v-icon>{{ icons.mdiCalendarBlankOutline }}</v-icon>
        </v-btn>
      </template>
    </drawer-top>
  </div>
</template>

<script>
import {mdiCalendarBlankOutline} from "@mdi/js";
import DrawerTop from "@/components/drawer/DrawerTop";

export default {
  name: "MessageHistory",
  props: {
    room: Object,
  },
  components: {
    DrawerTop
  },
  setup(props, {emit}) {

    const close = () => {
      emit('close')
    }

    return {

      close,

      icons: {
        mdiCalendarBlankOutline,
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
