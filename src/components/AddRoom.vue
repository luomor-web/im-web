<template>
  <div>
    <im-drawer title="创建群组" @close="closeAddRoom">
      <template #content="{}">
        <div class="d-table ma-auto">
          <v-hover>
            <template v-slot:default="{ hover }">
              <v-img
                  aspect-ratio="1"
                  height="150"
                  width="150"
                  class="header-img"
                  src="https://vue-advanced-chat.herokuapp.com/img/account-group.601fe668.svg"
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
        <div class="pb-3 mt-2">
          <template v-for="(item,index) in userSelect">
            <v-tooltip :key="index" top>
              <template v-slot:activator="{ on, attrs }">
                <div class="px-1 d-inline">
                  <v-avatar size="36" color="primary" v-bind="attrs"
                            v-on="on" @click="removeUser(item)">
                    <v-img src="https://cdn.vuetifyjs.com/images/logos/v.png"></v-img>
                  </v-avatar>
                </div>
              </template>
              <span>{{ item.username }}</span>
            </v-tooltip>
          </template>
        </div>
        <div class="d-flex align-center">
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
        <div class="overflow-y-auto pt-3">
          <v-list>
            <v-list-item-group v-model="userSelectIndex" multiple @change="operationUser">
              <template v-for="(item, i) in waitSelect">
                <v-list-item :key="i">
                  <template v-slot:default="{ active }">

                    <v-list-item-action>
                      <v-checkbox :input-value="active"></v-checkbox>
                    </v-list-item-action>

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

  </div>
</template>

<script>
import {
  mdiMagnify,
  mdiChatOutline,
  mdiArrowRight, mdiTicketAccount, mdiCamera
} from "@mdi/js";
import {ref, watch} from "@vue/composition-api";
import ImDrawer from "@/components/ImDrawer";
import {createGroup} from "@/net/message";

export default {
  name: "AddRoom",
  components: {ImDrawer},
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

    watch(() => props.users, (users) => {
      console.log('watch', users)
      waitSelect.value = [...users]
    })

    watch(() => props.visible, (visible) => {
      if (!visible) {
        clearData()
      }
    })

    const closeAddRoom = () => {
      context.emit('close')
    }

    const clearData = () => {
      waitSelect.value = []
      userSelect.value = []
      userSelectIndex.value = []
      errorVisible.value = false
      roomName.value = ''
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
      createGroup({isFriend: false, roomName: roomName.value, users: users})
      clearData()
      closeAddRoom()
    }

    const openUpload = () => {
      console.log('open')
    }

    const operationUser = item => {
      const items = item.map(x => {
        return waitSelect.value[x]
      })
      userSelect.value = [...items]
      console.log(item)
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

    return {
      errorVisible,
      roomName,
      waitSelect,
      userSelect,
      userSelectIndex,
      closeAddRoom,
      createRoom,
      operationUser,
      openUpload,
      removeUser,
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

@import "../styles/theme.scss";

.no-drag {
  -webkit-app-region: no-drag;
}

.header-img {
  border-radius: 150px;
  background-color: $v-grey-lighten1;
}
</style>
