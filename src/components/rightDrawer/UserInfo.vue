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
              <v-icon>{{ room.notice ? icons.mdiBellOutline : icons.mdiBellOffOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>通知</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch
                  v-model="notice"
                  @change="noticeChange"
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
import {inject, onMounted, ref, watch} from "@vue/composition-api";
import {mdiBellOffOutline, mdiBellOutline, mdiPencilOutline} from "@mdi/js";
import {userGroupConfig} from "@/net/message";

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
  setup(props) {

    const notice = ref(true)

    const close = inject('close', () => {})

    watch(props.room , room => {
      notice.value = room.notice
    })

    onMounted(()=>{
      notice.value = props.room.notice
    })

    const drawerTemporary = ref(true)

    const noticeChange = item => {
      console.log(item)
      const param = {
        roomId: props.room.roomId,
        notice: item,
        type: 'NOTICE'
      }
      userGroupConfig(param)
    }

    const changeUserProfile = () => {

    }

    return {
      notice,
      close,
      drawerTemporary,
      noticeChange,
      changeUserProfile,

      icons : {
        mdiPencilOutline,
        mdiBellOutline,
        mdiBellOffOutline,
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
