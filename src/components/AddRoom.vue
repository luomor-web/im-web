<template>
  <div>
    <im-drawer title="创建群组" @close="closeAddRoom">
      <template #content="{}">
        <div>
          <v-btn
              class="mx-2"
              large
              depressed
              fab
              dark
              justify="space-around"
              color="#b7c1ca"
          >
            <v-icon dark>
              mdi-heart
            </v-icon>
          </v-btn>
        </div>
        <div class="d-flex align-center py-2">
          <v-text-field v-model="roomName" light label="群组名称" single-line :prepend-icon="icons.mdiTicketAccount"
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
          >需要至少除您之外的两个用户</v-alert>
        </div>
        <div class="pb-3">
          <v-chip
              class="ma-2"
              close
              color="success"
              text-color="white"
              v-for="(item,index) of userSelect"
              :key="index"
              @click:close="operationUser(item)"
          >
            <v-avatar left>
              <v-img :src="item.avatar"></v-img>
            </v-avatar>
            {{ item.username }}
          </v-chip>
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
            <v-list-item
                v-for="(item, i) in waitSelect"
                :key="i"
                @click="showUserInfo"
            >
              <v-list-item-avatar>
                <v-img :src="item.avatar"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-text="item.username"></v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn small @click="operationUser(item)" :color="item.isSelect? 'error':'primary'">
                  {{ item.isSelect ? '移除' : '添加' }}
                </v-btn>
              </v-list-item-action>
            </v-list-item>
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
  mdiArrowRight, mdiTicketAccount
} from "@mdi/js";
import {ref, watch} from "@vue/composition-api";
import ImDrawer from "@/components/ImDrawer";

export default {
  name: "AddRoom",
  components: {ImDrawer},
  props: {
    users: Array
  },
  setup(props, context) {
    const errorVisible = ref(false)
    const waitSelect = ref([])
    const userSelect = ref([])
    const clock = ref(false)
    const roomName = ref('')

    watch(() => props.users, (users) => {
      console.log('watch', users)
      waitSelect.value = [...users]
    })

    const closeAddRoom = () => {
      context.emit('close')
    }

    const showUserInfo = () => {
      if (!clock.value) {
        console.log('showUserInfo')
      }
      clock.value = false
    }

    const createRoom = () => {
      if (userSelect.value.length <= 1) {
        errorVisible.value = true
      }
    }

    const operationUser = item => {
      const index = waitSelect.value.findIndex(r => r._id === item._id)
      if (waitSelect.value[index].isSelect) {
        waitSelect.value[index].isSelect = false

        const selectIndex = userSelect.value.findIndex(r => r._id === item._id)
        userSelect.value.splice(selectIndex, 1)
        userSelect.value = [...userSelect.value]

      } else {
        waitSelect.value[index] = {...item, isSelect: true}
        userSelect.value.push(item)
      }
      waitSelect.value = [...waitSelect.value]

      clock.value = true
    }

    return {
      errorVisible,
      roomName,
      waitSelect,
      userSelect,
      closeAddRoom,
      showUserInfo,
      createRoom,
      operationUser,
      icons: {
        mdiArrowRight,
        mdiMagnify,
        mdiChatOutline,
        mdiTicketAccount
      },

    }
  }
}
</script>

<style lang="scss" scoped>
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
