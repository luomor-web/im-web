<template>
  <im-drawer title="邀请用户" @close="closeInviteUser" :direction="true" :visible="visible">
    <template #content="{}">
      <div class="d-flex mb-2">
        <div>
          <h3>已选择({{ userSelect.length }})人</h3>
        </div>
        <v-spacer></v-spacer>
        <v-btn small color="primary" :disabled="userSelect.length===0" @click="joinGroup">确定</v-btn>
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
        <v-list>
          <v-list-item-group v-model="userSelectIndex" multiple @change="operationUser">
            <template v-for="(item, i) in waitSelect">
              <v-list-item :key="i" :disabled="item.isClud">
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
                    <v-btn small :color="active? 'error':'primary'" :disabled="item.isClud">
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
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {ref, watch} from "@vue/composition-api";
import {mdiArrowRight, mdiCamera, mdiChatOutline, mdiMagnify, mdiTicketAccount} from "@mdi/js";
import {joinUserGroup} from "@/net/message";

export default {
  name: "InviteUser",
  props: {
    room: Object,
    visible: Boolean,
    users: Array,
  },
  components: {
    ImDrawer
  },
  setup(props, context) {

    const userSelect = ref([])
    const userSelectIndex = ref([])
    const waitSelect = ref([])

    watch(() => props.users, (users) => {
      waitSelect.value = [...users]
      waitSelect.value.forEach(x => {
        x.isClud = props.room.users?.findIndex(r => r._id === x._id) !== -1
      })
    })

    const operationUser = item => {
      const items = item.map(x => {
        return waitSelect.value[x]
      })
      userSelect.value = [...items]
    }

    const joinGroup = () => {
      const users = userSelect.value.map(x => {
        return {
          _id: x._id
        }
      })
      const group = {
        roomId: props.room.roomId
      }
      joinUserGroup({group, users})
      clearData()
      context.emit('close')
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

    const clearData = () => {
      waitSelect.value = []
      userSelect.value = []
      userSelectIndex.value = []
    }

    const closeInviteUser = () => {
      context.emit('close')
      clearData()
    }

    const userListStyle = () => {
      const size = userSelect.value.length % 6 === 0 ? ( userSelect.value.length / 6 ): (Math.floor(userSelect.value.length / 6) + 1)
      const height = size * 58
      return `max-height: calc(100vh - ${height}px - 64px - 52px - 28px - 16px - 12px - 16px)`
    }

    return {
      userSelect,
      userSelectIndex,
      waitSelect,
      userListStyle,
      removeUser,
      closeInviteUser,
      operationUser,
      joinGroup,

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

.avatar{
  width: 52px;
}
</style>
