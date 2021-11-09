<template>
  <div>
    <im-drawer title="用户信息" @close="closeUserInfo" :direction="direction" :visible="visible"
               :temporary="drawerTemporary">
      <template #content="{}">
        <v-card flat>
          <div class="d-table ma-auto">
            <v-img
                aspect-ratio="1"
                height="150"
                width="150"
                class="header-img"
                :src="room.avatar"
            >
            </v-img>
          </div>
          <v-card-title class="d-table ma-auto text-h5">{{room.roomName}}</v-card-title>
        </v-card>

<!--        <div class="d-flex align-center py-2">-->
<!--          <v-text-field v-model="room.roomName"-->
<!--                        small-->
<!--                        light-->
<!--                        label="修改备注"-->
<!--                        single-line>-->
<!--          </v-text-field>-->
<!--          <v-spacer></v-spacer>-->
<!--          <v-btn color="primary"-->
<!--                 @click="changeUserProfile(null)"-->
<!--          >-->
<!--            确认-->
<!--          </v-btn>-->
<!--        </div>-->
      </template>
    </im-drawer>
  </div>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {ref} from "@vue/composition-api";

export default {
  name: "UserInfo",
  props: {
    visible: Boolean,
    direction: Boolean,
    room: Object
  },
  components: {
    ImDrawer
  },
  setup(props, context) {
    const drawerTemporary = ref(true)
    const closeUserInfo = () => {
      context.emit('close')
    }
    const changeUserProfile = () => {

    }
    return {
      drawerTemporary,
      closeUserInfo,
      changeUserProfile
    }
  }
}
</script>

<style lang="scss" scoped>

@import "../../styles/theme";

.header-img {
  border-radius: 150px;
  background-color: $v-grey-lighten1;
}


</style>
