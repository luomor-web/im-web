<template>
  <v-dialog v-model="model" width="600" persistent>
    <v-card height="500">
      <v-toolbar flat color="primary" dark class="px-3">
        <v-toolbar-title>选择</v-toolbar-title>
        <v-spacer />
        <v-text-field v-model="searchName" hide-details rounded dense filled placeholder="搜索"
                      @input="searchNameChange"
        />
        <v-btn icon @click="cancel">
          <v-icon>mdi-backup-restore</v-icon>
        </v-btn>
        <v-btn v-if="multiple" icon @click="sure">
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </v-toolbar>
      <div style="height: calc(100% - 64px)" class="d-flex">
        <v-tabs v-model="tab" vertical>
          <v-tab v-if="typesIncludeChat">
            <v-icon left>
              mdi-account
            </v-icon>
            会话
          </v-tab>
          <v-tab v-if="typesIncludeUser">
            <v-icon left>
              mdi-lock
            </v-icon>
            用户
          </v-tab>
          <v-tab v-if="typesIncludeGroup">
            <v-icon left>
              mdi-group
            </v-icon>
            群组
          </v-tab>
          <v-tabs-items v-model="tab" class="overflow-y-auto">
            <v-tab-item v-if="typesIncludeChat">
              <v-card flat>
                <v-list nav>
                  <v-list-item
                    v-for="(item,index) of filterLoadedRooms"
                    :key="index"
                    v-ripple
                    @click="operationSelect('chats',item)"
                  >
                    <v-list-item-avatar>
                      <v-img :src="item.avatar" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ item.roomName }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-tab-item>
            <v-tab-item v-if="typesIncludeUser">
              <v-card flat>
                <v-list nav>
                  <v-list-item v-for="(item,index) of userList" :key="index" v-ripple
                               @click="operationSelect('users',item)"
                  >
                    <v-list-item-avatar>
                      <v-img :src="item.avatar" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-badge
                        :color="item.status.state === 'online' ? 'green': 'grey'"
                        inline
                        left
                        dot
                      >
                        <v-list-item-title>{{ item.username }}</v-list-item-title>
                      </v-badge>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn v-if="isFriend(item)" color="success">
                        好友
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
                <div v-if="!dataLoaded" v-intersect="onIntersect" style="height: 40px" class="text-center">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  />
                </div>
              </v-card>
            </v-tab-item>
            <v-tab-item v-if="typesIncludeGroup">
              <v-card flat>
                <v-list nav>
                  <v-list-item v-for="(item,index) of groupList" :key="index" v-ripple
                               @click="operationSelect('groups',item)"
                  >
                    <v-list-item-avatar>
                      <v-img :src="item.avatar" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ item.roomName }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <div v-if="!dataLoaded" v-intersect="onIntersect" style="height: 40px" class="text-center">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  />
                </div>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
        <div v-if="multiple && !selectDataIsEmpty" style="width: 300px" class="overflow-y-auto">
          <v-chip v-for="(item,index) of selectData.chats" :key="index" class="ma-1" @click="remove('chats',item)">
            {{ item.roomName }}
            <v-avatar right>
              <v-img :src="item.avatar" />
            </v-avatar>
          </v-chip>
          <v-chip v-for="(item,index) of selectData.users" :key="index+'-user'" class="ma-1"
                  @click="remove('users',item)"
          >
            {{ item.username }}
            <v-avatar right>
              <v-img :src="item.avatar" />
            </v-avatar>
          </v-chip>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
<script>

import { computed, onMounted, onUnmounted, ref, watch } from '@vue/composition-api'
import store from '@/store'
import msg from '@/plugins/msg'
import { uuid } from '@/utils/id-util'
import { searchGroup, searchUser } from '@/net/send-message'

export default {
  name: 'ImUserSelectDialog',
  props: {
    multiple: { type: Boolean, default: false },
    model: { type: Boolean, default: false },
    types: { type: Array, default: () => ['PERSON'] },
    users: { type: Array, default: () => [] }
  },
  emits: ['sure', 'cancel'],
  setup (props, { emit }) {
    const loadedRooms = computed(() => store.state.loadedRooms)
    const selectDataIsEmpty = computed(() => {
      return selectData.value.chats.length === 0 && selectData.value.users.length === 0 && selectData.value.groups.length === 0
    })
    const selectData = ref({
      chats: [],
      users: [],
      groups: []
    })
    const tab = ref(null)
    const searchId = ref('')
    const userList = ref([])
    const groupList = ref([])
    const searchName = ref('')
    const dataLoaded = ref(false)
    const filterLoadedRooms = ref([])
    const lastSearchName = ref({
      PERSON: '',
      CHAT: '',
      GROUP: ''
    })

    onMounted(() => {
      msg.$on('COMMAND_SEARCH_USER_RESP', onSearchUserResp)
      msg.$on('COMMAND_SEARCH_GROUP_RESP', onSearchGroupResp)
    })

    onUnmounted(() => {
      msg.$off('COMMAND_SEARCH_USER_RESP')
      msg.$off('COMMAND_SEARCH_GROUP_RESP')
    })

    watch(() => props.model, model => {
      console.log('状态变化', model, props.types)
      if (model) {
        if (props.users) selectData.value.users = [...props.users]
        if (props.types.includes('CHAT')) filterLoadedRooms.value = loadedRooms.value
      } else {
        console.log('重置')
        groupList.value = []
        userList.value = []
        selectData.value.chats = []
        selectData.value.users = []
        selectData.value.groups = []
        searchId.value = ''
        searchName.value = ''
        dataLoaded.value = false
      }
    })

    watch(tab, (newVal, oldVal) => {
      console.log('tab变化', newVal)
      if (oldVal !== null && searchName.value !== lastSearchName.value[props.types[newVal]]) {
        searchNameChange(searchName.value)
      }
    })

    const onIntersect = (entries) => {
      if (entries[0].isIntersecting && props.model) {
        console.log('触发')
        const type = props.types[tab.value]
        switch (type) {
          case 'PERSON':
            searchUserReq(searchName.value)
            break
          case 'GROUP':
            searchGroupReq(searchName.value)
            break
        }
      }
    }

    const onSearchUserResp = (data) => {
      const { searchId: requestId, userList: returnList } = data.data
      if (requestId !== searchId.value) return
      for (const user of returnList) {
        const index = userList.value.findIndex(r => r._id === user._id)
        if (index === -1) {
          userList.value.push(user)
        }
      }
      userList.value = [...userList.value]
      searchId.value = ''
      dataLoaded.value = returnList.length < 20
    }

    const onSearchGroupResp = (data) => {
      const { searchId: requestId, roomList: returnList } = data.data
      console.log(requestId, '1', searchId.value)
      if (requestId !== searchId.value) return
      console.log('返回')
      for (const group of returnList) {
        const index = groupList.value.findIndex(r => r.roomId === group.roomId)
        if (index === -1) {
          groupList.value.push(group)
        }
      }
      groupList.value = [...groupList.value]
      searchId.value = ''
      dataLoaded.value = returnList.length < 20
    }

    const searchUserReq = (name) => {
      if (searchId.value) return
      const userId = userList.value.length > 0 ? userList.value[userList.value.length - 1]._id : ''
      searchId.value = uuid()
      searchUser(name, userId, searchId.value)
    }

    const searchGroupReq = (name) => {
      console.log('搜索群组')
      if (searchId.value) return
      const roomId = groupList.value.length > 0 ? groupList.value[groupList.value.length - 1].roomId : ''
      searchId.value = uuid()
      searchGroup(name, roomId, searchId.value)
      console.log(searchId.value)
    }

    const searchNameChange = (name) => {
      const type = props.types[tab.value]
      const valueElement = lastSearchName.value[type]
      if (name === valueElement) return
      lastSearchName.value[type] = name
      if (type === 'PERSON') {
        userList.value = []
        searchUserReq(name)
        return
      } else if (type === 'GROUP') {
        groupList.value = []
        searchGroupReq(name)
        return
      }
      filterLoadedRoom(name)
    }

    const filterLoadedRoom = (name) => {
      filterLoadedRooms.value = loadedRooms.value.filter(r => r.roomName.indexOf(name) !== -1)
    }

    const isFriend = (item) => {
      return loadedRooms.value.find(r => item._id === r.friendId)
    }

    const typesIncludeChat = computed(() => props.types.includes('CHAT'))
    const typesIncludeUser = computed(() => props.types.includes('PERSON'))
    const typesIncludeGroup = computed(() => props.types.includes('GROUP'))

    const operationSelect = (type, item) => {
      // 不是多选 直接返回
      if (!props.multiple) {
        sure(null, item, type)
        return
      }
      const key = type === 'users' ? '_id' : 'roomId'
      const index = selectData.value[type].findIndex(r => r[key] === item[key])
      if (index === -1) {
        selectData.value[type].push(item)
      } else {
        selectData.value[type].splice(index, 1)
      }
    }

    const remove = (type, item) => {
      const key = type === 'users' ? '_id' : 'roomId'
      const index = selectData.value[type].findIndex(r => r[key] === item[key])
      if (index !== -1) {
        selectData.value[type].splice(index, 1)
      }
    }

    const cancel = () => {
      emit('cancel')
    }

    const sure = (event, item, type) => {
      if (item) {
        emit('sure', item, type)
        return
      }
      emit('sure', selectData.value)
    }

    return {
      selectData,
      tab,
      userList,
      searchName,
      loadedRooms,
      dataLoaded,
      selectDataIsEmpty,
      filterLoadedRooms,
      groupList,
      remove,
      onIntersect,
      isFriend,
      searchNameChange,
      searchUserReq,
      operationSelect,
      typesIncludeGroup,
      typesIncludeUser,
      typesIncludeChat,
      sure,
      cancel
    }
  }
}
</script>
