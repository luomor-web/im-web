<template>
  <div>
    <im-drawer title="创建群组" @close="closeAddRoom" :visible="visible" :temporary="drawerTemporary">
      <template #content="{}">
        <div class="d-table ma-auto">
          <v-hover>
            <template v-slot:default="{ hover }">
              <v-img
                  aspect-ratio="1"
                  height="150"
                  width="150"
                  class="header-img"
                  :src="roomAvatar ? picUrl +roomAvatar :require('@/assets/images/default/account-group.svg')"
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
        <input type="file" ref="file" class="d-none" accept="image/*" @change="onFileChange($event.target.files)">
        <div class="d-flex align-center py-2">
          <v-text-field v-model="roomName"
                        light
                        label="群组名称"
                        single-line
                        :prepend-icon="icons.mdiTicketAccount"
                        :append-icon="roomName ? icons.mdiArrowRight : ''"
                        @click:append="createRoom">

          </v-text-field>
        </div>
        <div>
          <v-alert
              v-model="errorVisible"
              border="left"
              dense
              dismissible
              type="error"
          >需要至少除您之外的两个用户
          </v-alert>
        </div>
        <div class="d-flex mb-2">
          <div>
            <h3>已选择({{ userSelect.length }})人</h3>
          </div>
          <v-spacer></v-spacer>
        </div>
        <div class="pb-3 d-flex flex-row flex-wrap">
          <template v-for="(item,index) in userSelect">
            <div class="mx-1 d-flex flex-column avatar" :key="index">
              <div class="align-self-center">
                <v-badge
                    :color="item.status.state === 'online' ? 'green':'red'"
                    bordered
                    bottom
                    dot
                    overlap
                >
                  <v-avatar size="36" @click="removeUser(item)">
                    <v-img :src="item.avatar"></v-img>
                  </v-avatar>
                </v-badge>
              </div>
              <span class="subtitle-2 align-self-center">
              {{ item.username.length > 3 ? item.username.substring(0, 3) + '..' : item.username }}
            </span>
            </div>
          </template>
        </div>
        <div class="d-flex align-center pb-3">
          <v-text-field
              dense
              required
              rounded
              outlined
              :prepend-inner-icon="icons.mdiMagnify"
              placeholder="搜索"
              :hide-details="true"
          ></v-text-field>
        </div>
        <div class="overflow-y-auto" :style="userListStyle()">
          <v-list >
            <v-list-item-group v-model="userSelectIndex" multiple @change="operationUser">
              <template v-for="(item, i) in waitSelect">
                <v-list-item :key="i">
                  <template v-slot:default="{ active }">

                    <!--                    <v-list-item-action>-->
                    <!--                      <v-checkbox :input-value="active"></v-checkbox>-->
                    <!--                    </v-list-item-action>-->

                    <v-list-item-avatar>
                      <v-img :src="item.avatar"></v-img>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title v-text="item.username"></v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-btn small :color="active? 'error':'primary'">
                        {{ active ? '移除' : '添加' }}
                      </v-btn>
                    </v-list-item-action>

                  </template>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
        </div>
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
import {
  mdiMagnify,
  mdiChatOutline,
  mdiArrowRight, mdiTicketAccount, mdiCamera
} from "@mdi/js";
import {ref, watch} from "@vue/composition-api";
import ImDrawer from "@/components/drawer/ImDrawer";
import {createGroup} from "@/net/message";
import ImCropper from "@/components/system/ImCropper";

export default {
  name: "AddRoom",
  components: {ImDrawer, ImCropper},
  props: {
    users: Array,
    visible: Boolean
  },
  setup(props, context) {
    const errorVisible = ref(false)
    const userSelectIndex = ref([])
    const waitSelect = ref([])
    const userSelect = ref([])
    const roomName = ref('')
    const dialog = ref(false)
    const img = ref('')
    const drawerTemporary = ref(true)
    const cropper = ref(null)
    const file = ref(null)
    const roomAvatar = ref('')
    const picUrl = ref(process.env.VUE_APP_PIC_URL)

    watch(() => props.users, (users) => {
      waitSelect.value = [...users]
    })

    const closeAddRoom = () => {
      clearData()
      context.emit('close')
    }

    const clearData = () => {
      waitSelect.value = []
      userSelect.value = []
      userSelectIndex.value = []
      errorVisible.value = false
      roomName.value = ''
      roomAvatar.value = ''
    }

    const onFileChange = (files) => {
      drawerTemporary.value = false
      dialog.value = true

      img.value = URL.createObjectURL(files[0])
    }

    const closeDialog = () => {
      drawerTemporary.value = true
      dialog.value = false
      img.value = ''
    }

    const sure = (url) => {
      dialog.value = false
      roomAvatar.value = url
      drawerTemporary.value = true
    }

    const createRoom = () => {
      if (userSelect.value.length <= 1) {
        errorVisible.value = true
        return
      }
      const users = userSelect.value.map(x => {
        return {
          _id: x._id
        }
      })
      createGroup({isFriend: false, roomName: roomName.value, avatar: roomAvatar.value, users: users})
      clearData()
      closeAddRoom()
    }

    const openUpload = () => {
      file.value.click()
    }

    const operationUser = item => {
      const items = item.map(x => {
        return waitSelect.value[x]
      })
      userSelect.value = [...items]
    }

    const removeUser = (item) => {
      const index = waitSelect.value.findIndex(r => r._id === item._id);
      // 移除下标列表的数据
      const indexIndex = userSelectIndex.value.findIndex(r => r === index);
      userSelectIndex.value.splice(indexIndex, 1)
      // 移除已选择列表的数据
      const userIndex = userSelect.value.findIndex(r => r._id === item._id)
      userSelect.value.splice(userIndex, 1)
    }

    const userListStyle = () => {
      const size = userSelect.value.length % 6 === 0 ? ( userSelect.value.length / 6 ): (Math.floor(userSelect.value.length / 6) + 1)
      const height = size * 58
      return `max-height: calc(100vh - ${height}px - 424px)`
    }

    return {
      img,
      cropper,
      file,
      dialog,
      errorVisible,
      roomName,
      waitSelect,
      userSelect,
      userSelectIndex,
      drawerTemporary,
      roomAvatar,
      picUrl,
      userListStyle,
      closeDialog,
      sure,
      closeAddRoom,
      createRoom,
      operationUser,
      openUpload,
      removeUser,
      onFileChange,
      icons: {
        mdiArrowRight,
        mdiMagnify,
        mdiChatOutline,
        mdiTicketAccount,
        mdiCamera
      },

    }
  }
}
</script>

<style lang="scss" scoped>

@import "../../styles/theme";

.no-drag {
  -webkit-app-region: no-drag;
}

.header-img {
  border-radius: 150px;
  background-color: $v-grey-lighten1;
}

.cropper {
  height: 300px;
  background: #DDD;
}

.avatar {
  width: 52px;
}
</style>
