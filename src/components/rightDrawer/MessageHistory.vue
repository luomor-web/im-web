<template>
  <div>
    <drawer-top @close="close">
      <template #default>
        <v-text-field hide-details rounded dense filled placeholder="搜索">
        </v-text-field>
      </template>
      <template #right>
        <v-dialog width="470">

          <template v-slot:activator="{ on, attrs }">
            <v-btn
                v-bind="attrs"
                v-on="on"
                icon
            >
              <v-icon>{{ icons.mdiCalendarBlankOutline }}</v-icon>
            </v-btn>
          </template>
          <v-date-picker
              :prev-icon="icons.mdiChevronLeft"
              :next-icon="icons.mdiChevronRight"
              v-model="picker"
              :landscape="true"
              :first-day-of-week="0"
              locale="zh-cn"
          ></v-date-picker>
        </v-dialog>
      </template>
    </drawer-top>
  </div>
</template>

<script>
import {mdiCalendarBlankOutline, mdiChevronLeft, mdiChevronRight} from "@mdi/js";
import DrawerTop from "@/components/drawer/DrawerTop";
import {ref} from "@vue/composition-api";

export default {
  name: "MessageHistory",
  props: {
    room: Object,
  },
  components: {
    DrawerTop
  },
  setup(props, {emit}) {

    const picker = ref((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10))

    const close = () => {
      emit('close')
    }

    return {

      picker,
      close,

      icons: {
        mdiCalendarBlankOutline,
        mdiChevronLeft,
        mdiChevronRight,
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
