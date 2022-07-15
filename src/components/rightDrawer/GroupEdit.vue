<template>
  <div>
    <drawer-top :title="'编辑资料'" :sub="true" @close="open('GROUP_INFO')"></drawer-top>
    <div class="pt-2 mx-2">
      <div class="d-table ma-auto">
        <v-hover>
          <template v-slot:default="{ hover }">
            <v-img
                aspect-ratio="1"
                height="120"
                width="120"
                class="header-img"
                :src="roomAvatar ?  roomAvatar : room.avatar"
            >
              <v-fade-transition>
                <v-overlay
                    v-if="hover"
                    absolute
                >
                  <v-btn icon @click="openUpload" height="120" width="120">
                    <v-icon>{{ icons.mdiCamera }}</v-icon>
                  </v-btn>
                </v-overlay>
              </v-fade-transition>
            </v-img>
          </template>
        </v-hover>
      </div>
    </div>

    <im-upload ref="upload" @sure="sure"></im-upload>

    <div class="mx-2 mb-2 mt-8">
      <v-text-field
          v-model="roomName"
          label="群组名称"
          hide-details="auto"
          outlined
      >
      </v-text-field>
    </div>

    <div class="mx-2">
      <v-list nav>
        <v-list-item v-ripple class="im-list-item" @click="open('GROUP_USER_MANAGE')" v-if="isAdminOrSubAdmin">
          <v-list-item-icon>
            <v-icon>{{ icons.mdiLockOutline }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>成员管理</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-ripple class="im-list-item" @click="open('GROUP_HANDOVER_ADMIN')" v-if="isAdmin">
          <v-list-item-icon>
            <v-icon>{{ icons.mdiPoliceBadgeOutline }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>移交群组</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list>
    </div>


    <v-divider></v-divider>

    <div class="mx-2">
      <v-list nav>
        <v-list-item v-ripple class="im-list-item error--text" v-if="isAdmin" @click="startDisbandRoom">
          <v-list-item-icon>
            <v-icon color="red">{{ icons.mdiDeleteOutline }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>删除并解散群聊</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-ripple class="im-list-item error--text" v-if="!isAdmin" @click="startOutRoom">
          <v-list-item-icon>
            <v-icon color="red">{{ icons.mdiDeleteOutline }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>删除并退出群聊</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>

    <v-fab-transition>
      <v-btn
          class="mb-16 mr-8"
          v-show="showSure"
          absolute
          fab
          right
          bottom
          color="success"
          @click="roomNameChange"
      >
        <v-icon>{{ icons.mdiCheck }}</v-icon>
      </v-btn>
    </v-fab-transition>

    <im-warn-dialog :action="action"></im-warn-dialog>
  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {computed, inject, onMounted, ref, watch} from "@vue/composition-api";
import {disbandGroup, editGroupProfile, removeUserGroup} from "@/net/send-message";
import {mdiCamera, mdiCheck, mdiDeleteOutline, mdiLockOutline, mdiPoliceBadgeOutline} from "@mdi/js";
import ImUpload from "@/components/system/ImUpload";
import ImWarnDialog from "@/components/system/ImWarnDialog";
import store from "@/store";

export default {
  name: "GroupEdit",
  components: {
    ImWarnDialog,
    ImUpload,
    DrawerTop,
  },
  props: {
    room: {type: Object}
  },
  setup(props) {
    // 当前用户ID
    const curUserId = computed(()=> store.state.currentUserId)
    // 当前用户
    const curUser = ref(null)
    // 当前房间名称
    const roomName = ref('')
    // 房间头像
    const roomAvatar = ref('')
    // 图片预览地址
    const picUrl = ref(process.env.VUE_APP_PIC_URL)
    const upload = ref(null)
    // 头像路径
    const img = ref('')

    // 操作动作
    const action = ref({
      model: false,
      type: '',
      title: '',
      content: '',
      sure: () => {
        switch (action.value.type) {
          case "OUT_ROOM":
            outRoom()
            action.value.model = false
            break
          case "DISBAND_ROOM":
            disbandRoom()
            action.value.model = false
            break
        }
      },
      cancel: () => {
        action.value.model = false
      }
    })

    const isAdmin = computed(() => {
      return curUser.value?.role === 'ADMIN'
    })

    const isAdminOrSubAdmin = computed(() => {
      return curUser.value?.role === 'ADMIN' || curUser.value?.role === 'SUB_ADMIN'
    })

    // 是否展示确定按钮
    const showSure = computed(() => {
      return roomName.value !== props.room.roomName && roomName.value !== ''
    })

    watch(() => props.room, (room) => {
      init(room)
    })

    const init = (room) => {
      curUser.value = room?.users.find(r => r._id === curUserId.value)
      // isAdmin.value = curUser.value?.role === 'ADMIN'
      roomName.value = room?.roomName
    }

    const openUpload = () => {
      upload.value.startUpload()
    }

    const sure = (url) => {
      roomAvatar.value = url
      editGroupProfile({roomId: props.room.roomId, avatar: picUrl.value + url, roomName: roomName.value})
    }

    const roomNameChange = () => {
      editGroupProfile({roomId: props.room.roomId, roomName: roomName.value})
    }

    // 点击退出群组按钮, 主要强调弹出过程
    const startOutRoom = () => {
      action.value.model = true
      action.value.title = '退出群聊'
      action.value.content = '您确认离开群组吗?'
      action.value.type = 'OUT_ROOM'
    }

    const outRoom = () => {
      removeUserGroup({roomId: props.room.roomId, userId: curUser.value._id, type: 'OUT'})
      close()
    }

    // 点击退出群组按钮, 主要强调弹出过程
    const startDisbandRoom = () => {
      action.value.model = true
      action.value.title = '解散群聊'
      action.value.content = '您确认解散群组吗?'
      action.value.type = 'DISBAND_ROOM'
    }

    const disbandRoom = () => {
      disbandGroup({roomId: props.room.roomId})
      close()
    }

    onMounted(() => {
      init(props.room)
    })

    const close = inject('close',() => {})
    const open = inject('open',() => {})

    return {
      img,
      action,
      upload,
      isAdmin,
      roomAvatar,
      picUrl,
      roomName,
      showSure,
      isAdminOrSubAdmin,
      startDisbandRoom,
      startOutRoom,
      disbandRoom,
      outRoom,
      roomNameChange,
      openUpload,
      sure,
      open,
      close,

      icons: {
        mdiCamera,
        mdiLockOutline,
        mdiDeleteOutline,
        mdiCheck,
        mdiPoliceBadgeOutline
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
