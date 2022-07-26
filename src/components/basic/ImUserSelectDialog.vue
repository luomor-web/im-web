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
          <v-tab v-if="typesInclude('CHAT')">
            <v-icon left>
              mdi-account
            </v-icon>
            会话
          </v-tab>
          <v-tab v-if="typesInclude('PERSON')">
            <v-icon left>
              mdi-lock
            </v-icon>
            用户
          </v-tab>
          <v-tabs-items v-model="tab" class="overflow-y-auto">
            <v-tab-item v-if="typesInclude('CHAT')">
              <v-card flat>
                <v-list nav>
                  <v-list-item v-for="(item,index) of filterLoadedRooms" :key="index" v-ripple
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
            <v-tab-item v-if="typesInclude('PERSON')">
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
                <div v-if="!userLoaded" v-intersect="onIntersect" style="height: 40px" class="text-center">
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

import { computed, onMounted, ref, watch } from '@vue/composition-api'
import store from '@/store'
import msg from '@/plugins/msg'
import { uuid } from '@/utils/id-util'
import { searchUser } from '@/net/send-message'

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
    const selectDataIsEmpty = computed(() => (selectData.value.chats.length === 0 && selectData.value.users.length === 0))
    const selectData = ref({
      chats: [],
      users: []
    })
    const tab = ref(null)
    const searchId = ref('')
    const userList = ref([])
    const searchName = ref('')
    const userLoaded = ref(true)
    const filterLoadedRooms = ref([])
    const lastSearchName = ref({
      PERSON: '',
      CHAT: ''
    })

    onMounted(() => {
      msg.$on('COMMAND_SEARCH_USER_RESP', onSearchUserResp)
    })

    watch(() => props.model, model => {
      if (model) {
        searchUserReq()
        if (props.users) selectData.value.users = [...props.users]
        if (props.types.includes('CHAT')) filterLoadedRooms.value = loadedRooms.value
      } else {
        userList.value = []
        selectData.value.chats = []
        selectData.value.users = []
        searchId.value = ''
        searchName.value = ''
      }
    })

    watch(tab, (newVal, oldVal) => {
      if (oldVal !== null && searchName.value !== lastSearchName.value[props.types[newVal]]) {
        searchNameChange(searchName.value)
      }
    })

    const onIntersect = (entries) => {
      if (entries[0].isIntersecting) {
        searchUserReq(searchName.value)
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
      userLoaded.value = returnList.length < 20
    }

    const searchUserReq = (name) => {
      if (searchId.value) return
      const userId = userList.value.length > 0 ? userList.value[userList.value.length - 1]._id : ''
      searchId.value = uuid()
      searchUser(name, userId, searchId.value)
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
      }
      filterLoadedRoom(name)
    }

    const filterLoadedRoom = (name) => {
      filterLoadedRooms.value = loadedRooms.value.filter(r => r.roomName.indexOf(name) !== -1)
    }

    const isFriend = (item) => {
      return loadedRooms.value.find(r => item._id === r.friendId)
    }

    const typesInclude = type => props.types.includes(type)

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
      userLoaded,
      selectDataIsEmpty,
      filterLoadedRooms,
      remove,
      onIntersect,
      isFriend,
      searchNameChange,
      searchUserReq,
      operationSelect,
      typesInclude,
      sure,
      cancel
    }
  }
}
</script>