<template>
  <v-dialog v-model="visible" hide-overlay persistent>
    <div class="pa-2 d-flex container">
      <div class="left">
        <div class="d-flex align-center py-3">
          <v-text-field
              v-model="searchName"
              dense
              required
              rounded
              outlined
              :prepend-inner-icon="icons.mdiMagnify"
              placeholder="搜索"
              :hide-details="true"
              @input="inputChange"
              @focus="searchContentVisible = true"
          ></v-text-field>
        </div>
        <div class="user-container">
          <v-list>
            <v-list-item-group v-model="userSelectIndex" :multiple="multiple" @change="operationUser">
              <template v-for="(item, i) in waitSelect">
                <v-list-item :key="i" :disabled="item.disabled" :class="item.hide ? 'd-none':''">

                  <template v-slot:default="{ active }">
                    <v-list-item-avatar>
                      <v-img :src="item.avatar"></v-img>
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title v-text="item.username"></v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                      <v-btn small :color="active? 'error':'primary'" v-if="multiple" :disabled="item.disabled">
                        {{ active ? '移除' : '添加' }}
                      </v-btn>
                    </v-list-item-action>

                  </template>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
        </div>
      </div>
      <div class="right" v-if="multiple">
        <div class="d-flex mb-2 my-3" v-if="multiple">
          <div>
            <h3>已选择({{ userSelect.length }})人</h3>
          </div>
          <v-spacer></v-spacer>

        </div>
        <div class="select-container">
          <div class="pb-3 d-flex flex-row flex-wrap">
            <template v-for="(item, index) in userSelect">
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
        </div>
        <div class="d-flex">
          <v-spacer></v-spacer>
          <v-btn class="mr-2" text @click="close">取消</v-btn>
          <v-btn color="primary" :disabled="userSelect.length===0" @click="click">确定</v-btn>
        </div>
      </div>
      <div class="right" v-else>
        <v-card flat>
          <div class="d-table ma-auto">
            <v-img
                aspect-ratio="1"
                height="150"
                width="150"
                class="header-img"
                :src="selectUser.avatar"
            >
            </v-img>
          </div>
          <v-card-title class="d-table ma-auto text-h5">{{ selectUser.username }}</v-card-title>
          <div class="user-container"></div>
          <div class="d-flex">
            <v-spacer></v-spacer>
            <v-btn class="mr-2" text @click="close">取消</v-btn>
            <v-btn color="primary" @click="onlyAction">确定</v-btn>
          </div>
        </v-card>
      </div>
    </div>
  </v-dialog>

</template>

<script>
import {onMounted, ref, watch} from "@vue/composition-api";
import {mdiChatOutline, mdiDotsHorizontal, mdiMagnify} from "@mdi/js";
import {getUserList} from "@/net/message";
import msg from "@/plugins/msg";

export default {
  name: "UserSelect",
  props: {
    visible: Boolean,
    multiple: {
      type: Boolean,
      default: true
    },
    filter: {
      type: Array,
      default: () => {
        return []
      },
    }
  },
  setup(props, context) {
    // 当前已选择用户列表
    const userSelect = ref([])
    // 当前已选择用户下标
    const userSelectIndex = ref([])
    // 待选择列表
    const waitSelect = ref([])
    // 搜索名
    const searchName = ref('')
    // 仅可选择一个时选择的用户
    const selectUser = ref({})

    const removeUser = (item) => {
      const index = waitSelect.value.findIndex(r => r._id === item._id);
      // 移除下标列表的数据
      const indexIndex = userSelectIndex.value.findIndex(r => r === index);
      userSelectIndex.value.splice(indexIndex, 1)
      // 移除已选择列表的数据
      const userIndex = userSelect.value.findIndex(r => r._id === item._id)
      userSelect.value.splice(userIndex, 1)
    }

    // 点击人员列表
    const operationUser = item => {
      if (!props.multiple) {
        selectUser.value = {...waitSelect.value[item]}
        return
      }

      const items = item.map(x => {
        return waitSelect.value[x]
      })
      userSelect.value = [...items]
    }

    const onlyAction = () => {
      context.emit('action', selectUser.value)
      resetData()
    }

    const click = () => {
      context.emit('sure', userSelect.value)
      resetData()
    }

    const close = () => {
      context.emit('close')
      resetData()
    }

    const resetData = () => {
      userSelect.value = []
      userSelectIndex.value = []
      selectUser.value = {}
    }

    const inputChange = (item) => {
      waitSelect.value.forEach(r => r.hide = !r.username.includes(item))
    }

    watch(() => props.visible, (visible) => {
      filterUser(props.filter, !visible)
      console.log(visible, 'visible')
      // filterUser(props.filter, !visible)
    })

    const filterUser = (items, reset) => {
      console.log('调用')

      const filter = waitSelect.value.map(x => {
        return {
          ...x,
          disabled: reset ? false : items?.findIndex(r => r._id === x._id) !== -1,
          hide: false
        }
      })

      waitSelect.value = filter
      console.log(filter, 'filter')
    }

    onMounted(() => {
      getUserList()
      // 用户列表
      msg.$on("COMMAND_USER_LIST_RESP", (data) => {
        waitSelect.value = data.data
      })
    })

    return {
      userSelect,
      userSelectIndex,
      waitSelect,
      searchName,
      selectUser,
      close,
      inputChange,
      click,
      onlyAction,
      operationUser,
      removeUser,

      icons: {
        mdiMagnify,
        mdiChatOutline,
        mdiDotsHorizontal
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@import "../../styles/theme";

.avatar {
  width: 52px;
}

.container {
  background-color: white;
  height: 650px;

  .left {
    padding: 0 8px;
    width: 320px;

    .user-container {
      height: 570px;
      overflow-y: auto;
    }
  }

  .right {
    width: 320px;

    .select-container {
      height: 550px;
      overflow-y: auto;
    }

    .user-container {
      height: 360px;
    }

    .header-img {
      margin-top: 24px;
      border-radius: 150px;
      background-color: $v-grey-lighten1;
    }

  }
}


</style>
