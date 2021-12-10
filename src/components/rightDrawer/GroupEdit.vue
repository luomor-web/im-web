<template>
  <div>
    <drawer-top :title="'编辑资料'" :sub="true" @close="close"></drawer-top>
    <div class="pt-2">
      <div class="mx-2">
        <div class="d-table ma-auto">
          <input type="file" ref="file" class="d-none" accept="image/*" @change="onFileChange($event.target.files)">
          <v-hover v-if="isAdmin">
            <template v-slot:default="{ hover }">
              <v-img
                  aspect-ratio="1"
                  height="120"
                  width="120"
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
        </div>
        <div class="mx-2 mb-2 mt-8">
          <v-text-field
              v-if="isAdmin"
              v-model="roomName"
              label="群组名称"
              hide-details="auto"
              outlined
              @keyup.enter.native="roomNameChange"
          >
          </v-text-field>
        </div>
      </div>
      <div class="mx-2">
        <v-list nav>
          <v-list-item v-ripple class="im-list-item" @click="close">
            <v-list-item-icon>
              <v-icon>{{ icons.mdiLockOutline }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>成员管理</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </div>
    <v-divider></v-divider>
    <div class="mx-2">
      <v-list nav>
        <v-list-item v-ripple class="im-list-item error--text">
          <v-list-item-icon>
            <v-icon color="red">{{ icons.mdiDeleteOutline }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>删除并退出群聊</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
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
<!--    <v-card flat>-->
<!--      <v-list dense>-->
<!--        <v-list-item-title class="font-weight-black">群组资料</v-list-item-title>-->
<!--        <v-list-item class="pa-2">-->
<!--          <v-list-item-content>-->
<!--            <div class="pb-3 d-flex flex-row flex-wrap">-->
<!--              <add-user-icon :title="'邀请'" @click="userSelectModelOpen"></add-user-icon>-->
<!--              <template v-for="(item,index) in room.users">-->
<!--                <div class="px-2 d-flex flex-column " :key="index">-->
<!--                  <v-menu-->
<!--                      :key="item._id"-->
<!--                      :close-on-content-click="false"-->
<!--                      bottom-->
<!--                      min-width="200px"-->
<!--                      rounded-->
<!--                      offset-y-->
<!--                      @input="resetActionData(500)"-->
<!--                  >-->
<!--                    <template v-slot:activator="{ on: menu, attrs }">-->
<!--                      <v-tooltip bottom>-->
<!--                        <template v-slot:activator="{ on: tooltip }">-->
<!--                          <v-btn-->
<!--                              icon-->
<!--                              x-large-->
<!--                              v-bind="attrs"-->
<!--                              v-on="{...menu,...tooltip}"-->
<!--                          >-->
<!--                            <v-badge-->
<!--                                :color="item.status.state === 'online' ? 'green':'red'"-->
<!--                                bordered-->
<!--                                bottom-->
<!--                                dot-->
<!--                                overlap-->
<!--                            >-->
<!--                              <v-avatar size="36" class="align-self-center">-->
<!--                                <v-img :src="item.avatar"></v-img>-->
<!--                              </v-avatar>-->
<!--                            </v-badge>-->
<!--                          </v-btn>-->
<!--                        </template>-->
<!--                        {{ item.role === 'ADMIN' ? '群主' : item.role === 'SUB_ADMIN' ? '管理员' : '成员' }}-->
<!--                      </v-tooltip>-->
<!--                    </template>-->
<!--                    <v-card>-->
<!--                      <v-list-item-content class="justify-center">-->
<!--                        <div class="mx-auto text-center">-->
<!--                          <v-avatar size="36" class="align-self-center mb-2">-->
<!--                            <v-img :src="item.avatar"></v-img>-->
<!--                          </v-avatar>-->
<!--                          <h4>{{ item.username }}</h4>-->
<!--                          <div v-if="canStartChat(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                @click="startChat(item)"-->
<!--                            >-->
<!--                              开始会话-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                          <div v-if="canRemoveRoom(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                v-if="!action.removeAction"-->
<!--                                @click="clickSureButton('removeAction')"-->
<!--                            >-->
<!--                              移出群聊-->
<!--                            </v-btn>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                color="error"-->
<!--                                v-else-->
<!--                                @click="removeRoom(item)"-->
<!--                            >-->
<!--                              确定移出吗-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                          <div v-if="canOutRoom(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                v-if="!action.outAction"-->
<!--                                @click="clickSureButton('outAction')"-->
<!--                            >-->
<!--                              退出群聊-->
<!--                            </v-btn>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                color="error"-->
<!--                                v-else-->
<!--                                @click="outRoom(item)"-->
<!--                            >-->
<!--                              确定退出吗-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                          <div v-if="canHandoverRoom(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                v-if="!action.handoverAction"-->
<!--                                @click="clickSureButton('handoverAction')"-->
<!--                            >-->
<!--                              移交群主-->
<!--                            </v-btn>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                color="error"-->
<!--                                v-else-->
<!--                                @click="handoverRoom(item)"-->
<!--                            >-->
<!--                              确定移交吗-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                          <div v-if="canDisbandRoom(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                v-if="!action.disbandAction"-->
<!--                                @click="clickSureButton('disbandAction')"-->
<!--                            >-->
<!--                              解散群聊-->
<!--                            </v-btn>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                color="error"-->
<!--                                v-else-->
<!--                                @click="disbandRoom()"-->
<!--                            >-->
<!--                              确定解散吗-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </v-list-item-content>-->
<!--                    </v-card>-->
<!--                  </v-menu>-->

<!--                  <span class="subtitle-2 align-self-center text&#45;&#45;secondary">-->
<!--                        {{ item.username.length > 3 ? item.username.substring(0, 3) + '..' : item.username }}-->
<!--                      </span>-->
<!--                </div>-->
<!--              </template>-->
<!--            </div>-->
<!--          </v-list-item-content>-->
<!--        </v-list-item>-->
<!--      </v-list>-->
<!--    </v-card>-->
<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {onMounted, ref, watch} from "@vue/composition-api";
import localStoreUtil from "@/utils/local-store";
import {editGroupProfile} from "@/net/message";
import {mdiCamera, mdiDeleteOutline, mdiLockOutline} from "@mdi/js";
import ImCropper from "@/components/system/ImCropper";

export default {
  name: "GroupEdit",
  components: {
    DrawerTop,
    ImCropper
  },
  props: {
    room: {type: Object}
  },
  setup(props, {emit}) {
    // 当前用户ID
    const curUserId = ref(localStoreUtil.getValue('userId'))
    // 当前用汉语
    const curUser = ref(null)
    // 当前房间名称
    const roomName = ref('')
    // 房间头像
    const roomAvatar = ref('')
    // 图片预览地址
    const picUrl = ref(process.env.VUE_APP_PIC_URL)
    const file = ref(null)
    const dialog = ref(false)
    // 头像路径
    const img = ref('')
    const isAdmin = ref(false)

    watch(() => props.room, (room) => {
      console.log(room)
      init(room)
    })

    const init = (room) => {
      curUser.value = room?.users.find(r => r._id === curUserId.value)
      isAdmin.value = curUser.value?.role === 'ADMIN'
      roomName.value = room?.roomName
    }

    const onFileChange = (files) => {
      dialog.value = true

      img.value = URL.createObjectURL(files[0])
    }

    const closeDialog = () => {
      dialog.value = false
      img.value = ''
    }

    const openUpload = () => {
      file.value.click()
    }

    const sure = (url) => {
      dialog.value = false
      roomAvatar.value = url

      editGroupProfile({roomId: props.room.roomId, avatar: picUrl.value + url, roomName: roomName.value})
    }

    const roomNameChange = () => {
      editGroupProfile({roomId: props.room.roomId, roomName: roomName.value})
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
      console.log(props.room,'room')
      init(props.room)
    })

    const close = (item) => {
      if (!item){
        emit('close','GROUP_INFO')
        return
      }
      emit('close','GROUP_USER_MANAGE')
    }

    return {
      img,
      file,
      isAdmin,
      roomAvatar,
      picUrl,
      dialog,
      roomName,
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
