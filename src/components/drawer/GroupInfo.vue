<template>
  <div>
    <im-drawer title="群组信息" @close="closeGroupInfo" :visible="visible" :direction="true"
               :temporary="drawerTemporary">
      <template #content="{}">
        <v-card flat>
          <div class="d-table ma-auto">
            <v-hover v-if="isAdmin">
              <template v-slot:default="{ hover }">
                <v-img
                    aspect-ratio="1"
                    height="150"
                    width="150"
                    class="header-img"
                    :src="roomAvatar ? picUrl + roomAvatar : room.avatar"
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
            <v-img
                v-else
                aspect-ratio="1"
                height="150"
                width="150"
                class="header-img"
                :src="room.avatar"
            >
            </v-img>
          </div>
          <input type="file" ref="file" class="d-none" accept="image/*" @change="onFileChange($event.target.files)">

          <!--        <div class="d-flex align-center">
                        {{ room.roomName }}
                        <v-btn icon>
                          <v-icon>{{ icons.mdiPencilBoxMultipleOutline }}</v-icon>
                        </v-btn>
                      </div>-->
          <v-text-field
              v-if="isAdmin"
              v-model="roomName"
              light
              label="群组名称"
              single-line
              :prepend-icon="icons.mdiTicketAccount"
              :append-icon="roomName !== room.roomName && roomName !== '' ? icons.mdiArrowRight : ''"
              @click:append="roomNameChange"
              @keyup.enter.native="roomNameChange"
          >
          </v-text-field>
          <v-card-title class="d-table ma-auto text-h5" v-else>{{ room.roomName }}</v-card-title>
        </v-card>
        <v-card flat>
          <v-list dense>
            <v-list-item-title class="font-weight-black">群组资料</v-list-item-title>
            <!--            <v-subheader>群组成员</v-subheader>-->
            <v-list-item class="pa-2">
              <!--                <v-list-item-icon>
                                <v-icon v-text="mdiIceCream"></v-icon>
                              </v-list-item-icon>-->
              <v-list-item-content>
                <div class="pb-3 d-flex flex-row flex-wrap">
                  <template v-for="(item,index) in room.users">
                    <div class="px-2 d-flex flex-column " :key="index">
                      <v-menu
                          :key="item._id"
                          :close-on-content-click="false"
                          bottom
                          min-width="200px"
                          rounded
                          offset-y
                          @input="resetActionData(500)"
                      >
                        <template v-slot:activator="{ on: menu, attrs }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                  icon
                                  x-large
                                  v-bind="attrs"
                                  v-on="{...menu,...tooltip}"
                              >
                                <v-badge
                                    :color="item.status.state === 'online' ? 'green':'red'"
                                    bordered
                                    bottom
                                    dot
                                    overlap
                                >
                                  <v-avatar size="36" class="align-self-center">
                                    <v-img :src="item.avatar"></v-img>
                                  </v-avatar>
                                </v-badge>
                              </v-btn>
                            </template>
                            {{ item.role === 'ADMIN' ? '群主' : item.role === 'SUB_ADMIN' ? '管理员' : '成员' }}
                          </v-tooltip>
                        </template>
                        <v-card>
                          <v-list-item-content class="justify-center">
                            <div class="mx-auto text-center">
                              <v-avatar size="36" class="align-self-center mb-2">
                                <v-img :src="item.avatar"></v-img>
                              </v-avatar>
                              <h4>{{ item.username }}</h4>
                              <div v-if="canStartChat(item)">
                                <v-divider class="my-3"></v-divider>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    @click="startChat(item)"
                                >
                                  开始会话
                                </v-btn>
                              </div>
                              <div v-if="canRemoveRoom(item)">
                                <v-divider class="my-3"></v-divider>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    v-if="!action.removeAction"
                                    @click="clickSureButton('removeAction')"
                                >
                                  移出群聊
                                </v-btn>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    color="error"
                                    v-else
                                    @click="removeRoom(item)"
                                >
                                  确定移出吗
                                </v-btn>
                              </div>
                              <div v-if="canOutRoom(item)">
                                <v-divider class="my-3"></v-divider>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    v-if="!action.outAction"
                                    @click="clickSureButton('outAction')"
                                >
                                  退出群聊
                                </v-btn>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    color="error"
                                    v-else
                                    @click="outRoom(item)"
                                >
                                  确定退出吗
                                </v-btn>
                              </div>
                              <div v-if="canHandoverRoom(item)">
                                <v-divider class="my-3"></v-divider>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    v-if="!action.handoverAction"
                                    @click="clickSureButton('handoverAction')"
                                >
                                  移交群主
                                </v-btn>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    color="error"
                                    v-else
                                    @click="handoverRoom(item)"
                                >
                                  确定移交吗
                                </v-btn>
                              </div>
                              <div v-if="canDisbandRoom(item)">
                                <v-divider class="my-3"></v-divider>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    v-if="!action.disbandAction"
                                    @click="clickSureButton('disbandAction')"
                                >
                                  解散群聊
                                </v-btn>
                                <v-btn
                                    depressed
                                    rounded
                                    text
                                    color="error"
                                    v-else
                                    @click="disbandRoom()"
                                >
                                  确定解散吗
                                </v-btn>
                              </div>
                            </div>
                          </v-list-item-content>
                        </v-card>
                      </v-menu>

                      <span class="subtitle-2 align-self-center">
                        {{ item.username.length > 3 ? item.username.substring(0, 3) + '..' : item.username }}
                      </span>
                    </div>
                  </template>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </template>
    </im-drawer>
    <v-dialog
        hide-overlay
        persistent
        v-model="dialog"
        width="500"
    >
      <im-cropper :img="img" @sure="sure" @cancel="closeDialog"></im-cropper>
    </v-dialog>
  </div>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {ref, watch} from "@vue/composition-api";
import localStoreUtil from "@/utils/local-store";
import {disbandGroup, editGroupProfile, handoverUserGroup, removeUserGroup} from "@/net/message";
import {
  mdiArrowRight,
  mdiCamera,
  mdiPencil,
  mdiPencilBox,
  mdiPencilBoxMultipleOutline,
  mdiTicketAccount
} from "@mdi/js";
import ImCropper from "@/components/system/ImCropper";

export default {
  name: "GroupInfo",
  props: {
    visible: Boolean,
    room: Object
  },
  components: {
    ImDrawer,
    ImCropper
  },
  setup(props, context) {
    const drawerTemporary = ref(true)
    const curUserId = ref(localStoreUtil.getValue('userId'))
    const curUser = ref(null)
    const isAdmin = ref(false)
    const roomAvatar = ref('')
    const picUrl = ref(process.env.VUE_APP_PIC_URL)
    const file = ref(null)
    const dialog = ref(false)
    const img = ref('')

    const roomName = ref('')

    const action = ref({
      removeAction: false,
      outAction: false,
      handoverAction: false,
      disbandAction: false
    })

    const resetActionData = (timeout) => {
      setTimeout(() => {
        action.value = {
          removeAction: false,
          outAction: false,
          handoverAction: false,
          disbandAction: false
        }
      }, timeout)
    }

    const clickSureButton = (item) => {
      if (action.value.handoverAction || action.value.removeAction || action.value.disbandAction || action.value.outAction) {
        action.value = {
          removeAction: false,
          outAction: false,
          handoverAction: false,
          disbandAction: false
        }
      }
      action.value[item] = true
    }

    watch(() => props.room, (room) => {
      const index = room.users.findIndex(r => r._id === curUserId.value);
      curUser.value = room.users[index]
      isAdmin.value = curUser.value.role === 'ADMIN'
      roomName.value = room.roomName
    })

    const closeGroupInfo = () => {
      context.emit('close')
    }

    const removeRoom = (item) => {
      action.value.removeAction = false
      removeUserGroup({roomId: props.room.roomId, userId: item._id, type: 'REMOVE'})
    }

    const outRoom = (item) => {
      action.value.outAction = false
      removeUserGroup({roomId: props.room.roomId, userId: item._id, type: 'OUT'})
      closeGroupInfo()
    }

    const handoverRoom = (item) => {
      action.value.handoverAction = false
      handoverUserGroup({roomId: props.room.roomId, userId: item._id})
    }

    const disbandRoom = () => {
      action.value.disbandAction = false
      disbandGroup({roomId: props.room.roomId})
      closeGroupInfo()
    }

    const startChat = (item) => {
      context.emit('chat', item)
    }

    const canStartChat = (item) => {
      return item._id !== curUserId.value
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

    const roomNameChange = () => {
      editGroupProfile({roomId: props.room.roomId, roomName: roomName.value})
    }

    const openUpload = () => {
      file.value.click()
    }

    const onFileChange = (files) => {
      drawerTemporary.value = false
      dialog.value = true

      img.value = URL.createObjectURL(files[0])
    }

    const sure = (url) => {
      dialog.value = false
      drawerTemporary.value = true
      roomAvatar.value = url

      editGroupProfile({roomId: props.room.roomId, avatar: picUrl.value + url, roomName: roomName.value})
    }

    const closeDialog = () => {
      drawerTemporary.value = true
      dialog.value = false
      img.value = ''
    }

    return {
      file,
      img,
      dialog,
      picUrl,
      roomAvatar,
      isAdmin,
      roomName,
      curUser,
      curUserId,
      action,
      drawerTemporary,
      closeDialog,
      sure,
      onFileChange,
      openUpload,
      clickSureButton,
      outRoom,
      resetActionData,
      canStartChat,
      canRemoveRoom,
      handoverRoom,
      canOutRoom,
      disbandRoom,
      canDisbandRoom,
      closeGroupInfo,
      canHandoverRoom,
      removeRoom,
      startChat,
      roomNameChange,

      icons: {
        mdiPencil,
        mdiPencilBox,
        mdiPencilBoxMultipleOutline,
        mdiTicketAccount,
        mdiArrowRight,
        mdiCamera
      }
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
