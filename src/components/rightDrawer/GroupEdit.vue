<template>
  <div>
    <drawer-top :title="'编辑资料'" :sub="true" @close="close('GROUP_INFO')"></drawer-top>
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
                  <v-btn icon @click="openUpload" height="150" width="150">
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
        <v-list-item v-ripple class="im-list-item" @click="close('GROUP_USER_MANAGE')">
          <v-list-item-icon>
            <v-icon>{{ icons.mdiLockOutline }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>成员管理</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-ripple class="im-list-item" @click="close('GROUP_HANDOVER_ADMIN')" v-if="isAdmin">
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
        <v-list-item v-ripple class="im-list-item error--text" v-if="isAdmin" @click="disbandRoom">
          <v-list-item-icon>
            <v-icon color="red">{{ icons.mdiDeleteOutline }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>删除并解散群聊</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-ripple class="im-list-item error--text" v-if="!isAdmin" @click="outRoom">
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
  </div>
</template>

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {computed, onMounted, ref, watch} from "@vue/composition-api";
import localStoreUtil from "@/utils/local-store";
import {disbandGroup, editGroupProfile, removeUserGroup} from "@/net/message";
import {mdiCamera, mdiCheck, mdiDeleteOutline, mdiLockOutline, mdiPoliceBadgeOutline} from "@mdi/js";
import ImUpload from "@/components/system/ImUpload";

export default {
  name: "GroupEdit",
  components: {
    ImUpload,
    DrawerTop,
  },
  props: {
    room: {type: Object}
  },
  setup(props, {emit}) {
    // 当前用户ID
    const curUserId = ref(localStoreUtil.getValue('userId'))
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
    // 是否管理员
    const isAdmin = ref(false)

    // 是否展示确定按钮
    const showSure = computed(() => {
      return roomName.value !== props.room.roomName && roomName.value !== ''
    })

    watch(() => props.room, (room) => {
      console.log('数据变化')
      init(room)
    })

    const init = (room) => {
      curUser.value = room?.users.find(r => r._id === curUserId.value)
      isAdmin.value = curUser.value?.role === 'ADMIN'
      roomName.value = room?.roomName
    }

    const onFileChange = (files) => {
      img.value = URL.createObjectURL(files[0])
    }

    const closeDialog = () => {
      img.value = ''
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

    const outRoom = () => {
      removeUserGroup({roomId: props.room.roomId, userId: curUser.value._id, type: 'OUT'})
      close()
    }

    const disbandRoom = () => {
      disbandGroup({roomId: props.room.roomId})
      close()
    }

    // 不是当前用户且当前用户不是普通人
    const canRemoveRoom = (item) => {
      return curUserId.value !== item._id && curUser.value?.role !== 'GENERAL'
    }

    const canOutRoom = (item) => {
      return curUserId.value === item._id && curUser.value?.role !== 'ADMIN'
    }

    const canHandoverRoom = (item) => {
      return curUserId.value !== item._id && curUser.value?.role === 'ADMIN'
    }

    const canDisbandRoom = (item) => {
      return curUserId.value === item._id && curUser.value?.role === 'ADMIN'
    }

    const canStartChat = (item) => {
      return item._id !== curUserId.value
    }

    onMounted(() => {
      init(props.room)
    })

    const close = (item) => {
      if (item) {
        emit('close', item)
        return
      }
      emit('close')
    }

    return {
      img,
      upload,
      isAdmin,
      roomAvatar,
      picUrl,
      roomName,
      showSure,
      disbandRoom,
      outRoom,
      roomNameChange,
      canStartChat,
      canRemoveRoom,
      canOutRoom,
      canDisbandRoom,
      canHandoverRoom,
      onFileChange,
      closeDialog,
      openUpload,
      sure,
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
