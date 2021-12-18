<template>
  <div>
    <v-window v-model="active">
      <v-window-item value="SELECT_USER">

        <add-room-select-user
            :icon="icons.mdiArrowRight"
            @close="closeAddRoom"
            @to-go="toGo('GROUP_SETTING',$event)"
        />

      </v-window-item>
      <v-window-item value="GROUP_SETTING">

        <add-room-group-info
            @to-go="toGo"
            @close="closeAddRoom"
            :user-select="userSelect"
        />

      </v-window-item>
    </v-window>
  </div>
</template>

<script>
import {ref} from "@vue/composition-api";
import AddRoomSelectUser from "@/components/leftDrawer/AddRoomSelectUser";
import AddRoomGroupInfo from "@/components/leftDrawer/AddRoomGroupInfo";
import {mdiArrowRight} from "@mdi/js";

export default {
  name: "AddRoom",
  components: {
    AddRoomGroupInfo,
    AddRoomSelectUser,
  },
  props: {},
  setup(props, context) {

    const active = ref('SELECT_USER')
    const userSelect = ref([])

    const closeAddRoom = () => {
      clearData()
      context.emit('close', '')
    }

    const clearData = () => {
      userSelect.value = []
    }

    const toGo = (item, users) => {
      active.value = item
      if(!users) return
      userSelect.value = [...users]
    }

    return {
      userSelect,
      active,
      toGo,
      closeAddRoom,
      icons: {
        mdiArrowRight
      },

    }
  }
}
</script>

<style lang="scss" scoped>

</style>
