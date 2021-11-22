<template>
  <div :style="{'height': 'calc(100vh - ' + height +'px'}">
    <div class="d-flex mb-2" v-if="multiple">
      <div>
        <h3>已选择({{ userSelect.length }})人</h3>
      </div>
      <v-spacer></v-spacer>
      <v-btn small color="primary" :disabled="userSelect.length===0" @click="aloneClick" v-if="useAlone">确定</v-btn>
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
    <div class="overflow-y-auto" :style="userListStyle()">
      <v-list>
        <v-list-item-group v-model="userSelectIndex" :multiple="multiple" @change="operationUser">
          <template v-for="(item, i) in waitSelect">
            <v-list-item :key="i" :disabled="item.isClud" :class="item.isFilter ? '':'d-none'">
              <template v-slot:default="{ active }">

                <v-list-item-avatar>
                  <v-img :src="item.avatar"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="item.username"></v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn small :color="active? 'error':'primary'" v-if="multiple" :disabled="item.isClud">
                    {{ active ? '移除' : '添加' }}
                  </v-btn>
                  <v-btn icon @click="onlyAction(item)" v-else>
                    <v-icon>{{ icons.mdiChatOutline }}</v-icon>
                  </v-btn>
                </v-list-item-action>

              </template>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>
    </div>
  </div>
</template>

<script>
import {onMounted, ref} from "@vue/composition-api";
import {mdiChatOutline, mdiMagnify} from "@mdi/js";
import {getUserList} from "@/net/message";
import msg from "@/plugins/msg";

export default {
  name: "UserSelect",
  props: {
    height: Number,
    multiple: {
      type: Boolean,
      default: true
    },
    useAlone: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Array,
      default: () => {
        return []
      },
    }
  },
  setup(props, context) {
    const userSelect = ref([])
    const userSelectIndex = ref([])
    const filterSelect = ref([])
    const waitSelect = ref([])
    const searchName = ref('')

    const removeUser = (item) => {
      const index = waitSelect.value.findIndex(r => r._id === item._id);
      // 移除下标列表的数据
      const indexIndex = userSelectIndex.value.findIndex(r => r === index);
      userSelectIndex.value.splice(indexIndex, 1)
      // 移除已选择列表的数据
      const userIndex = userSelect.value.findIndex(r => r._id === item._id)
      userSelect.value.splice(userIndex, 1)
    }

    const operationUser = item => {
      if (!props.multiple) {
        context.emit('contentClick', waitSelect.value[item])
        return
      }

      const items = item.map(x => {
        return waitSelect.value[x]
      })
      userSelect.value = [...items]
      context.emit('operationUser', userSelect.value)
    }

    const userListStyle = () => {
      const size = userSelect.value.length % 6 === 0 ? (userSelect.value.length / 6) : (Math.floor(userSelect.value.length / 6) + 1)
      const height = size * 58
      return `max-height: calc(100vh - ${props.height}px - ${height}px - 92px)`
    }

    const onlyAction = (item) => {
      context.emit('action', item)
    }

    const aloneClick = () => {
      context.emit('aloneClick')
    }

    const inputChange = (item) => {
      console.log(item)
       waitSelect.value.forEach(r => {
        if (r.username.includes(item)){
          r.isFilter = true
        }else {
          r.isFilter = false
        }}
      )
    }

    onMounted(() => {
      getUserList()

      // 用户列表
      msg.$on("COMMAND_USER_LIST_RESP", (data) => {
        waitSelect.value = data.data
        waitSelect.value.forEach(x => {
          x.isClud = props.filter?.findIndex(r => r._id === x._id) !== -1
          x.isFilter = true
        })
      })
    })

    return {
      userSelect,
      userSelectIndex,
      waitSelect,
      searchName,
      filterSelect,
      inputChange,
      aloneClick,
      onlyAction,
      operationUser,
      removeUser,
      userListStyle,

      icons: {
        mdiMagnify,
        mdiChatOutline
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.avatar {
  width: 52px;
}
</style>