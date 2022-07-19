<template>
  <v-dialog v-model="model" width="600" persistent>
    <v-card height="500">
      <v-toolbar flat color="primary" dark class="px-3">
        <v-toolbar-title>选择</v-toolbar-title>
        <v-spacer/>
        <v-text-field v-model="searchName" hide-details rounded dense filled placeholder="搜索"
                      @input="searchNameChange"/>
        <v-btn icon @click="cancel">
          <v-icon>mdi-backup-restore</v-icon>
        </v-btn>
        <v-btn icon  v-if="multiple">
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
          <v-tabs-items v-model="tab" class=" overflow-y-auto">
            <v-tab-item v-if="typesInclude('CHAT')">
              <v-card flat>
                <v-list nav>
                  <v-list-item v-ripple v-for="(item,index) of loadedRooms" :key="index"
                               @click="operationSelect('chats',item)">
                    <v-list-item-avatar>
                      <v-img :src="item.avatar"/>
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
                  <v-list-item v-ripple v-for="(item,index) of userList" :key="index"
                               @click="operationSelect('users',item)">
                    <v-list-item-avatar>
                      <v-img :src="item.avatar"/>
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
                      <v-btn color="success" v-if="isFriend(item)">好友</v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
        <div style="width: 230px" v-if="multiple">
          你好
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
<script>

import {computed, onMounted, ref, watch} from "@vue/composition-api";
import store from "@/store";
import msg from "@/plugins/msg";
import {uuid} from "@/utils/id-util";
import {searchUser} from "@/net/send-message";

export default {
  name: "ImUserSelectDialog",
  props: {
    multiple: {type: Boolean, default: false},
    model: {type: Boolean, default: false},
    types: {type: Array, default: () => ['PERSON']},
    action: Object,
  },
  emits: ['sure', 'cancel'],
  setup(props, {emit}) {
    const loadedRooms = computed(() => store.state.loadedRooms)
    const selectData = ref({
      chats: [],
      users: []
    })
    const tab = ref(props.types[0])
    const searchId = ref('')
    const userList = ref([])
    const searchName = ref('')
    const observer = ref(null)

    onMounted(() => {
      msg.$on("COMMAND_SEARCH_USER_RESP", onSearchUserResp)
    })

    watch(() => props.model, model => {
      if (model) {
        searchUserReq()
      } else {
        userList.value = []
        selectData.value = {
          groups: [],
          chats: [],
          users: []
        }
        searchId.value = ''
      }
    })

    const onSearchUserResp = (data) => {

      const {searchId: requestId, userList: returnList} = data.data
      if (requestId !== searchId.value) return
      userList.value.push(...returnList)
      userList.value = [...userList.value]
      searchId.value = ''
    }

    const searchUserReq = (name) => {
      if (searchId.value) return
      const userId = userList.value.length > 0 ? userList.value[0]._id : ''
      searchId.value = uuid()
      searchUser(name, userId, searchId.value)
    }

    const searchNameChange = (name) => {
      userList.value = []
      searchUserReq(name)
    }

    const isFriend = (item) => {
      return loadedRooms.value.find(r => item._id === r.friendId)
    }

    const initIntersectionObserver = () => {
      if (observer.value) {
        this.showLoader = true
        observer.value.disconnect()
      }

      const loader = document.getElementById('infinite-loader-rooms')

      if (loader) {
        const options = {
          root: document.getElementById('rooms-list'),
          rootMargin: '60px',
          threshold: 0
        }

        observer.value = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            this.loadMoreRooms()
          }
        }, options)

        observer.value.observe(loader)
      }
    }

    const typesInclude = type => props.types.includes(type)

    const operationSelect = (type, item) => {
      // 不是多选 直接返回
      if (!props.multiple) {
        sure(item, type)
        return
      }
      selectData.value[type].push(item)
    }

    const cancel = () => {
      emit('cancel')
    }

    const sure = (item, type) => {
      if (item) {
        emit('sure', item, type)
        return
      }
      emit('sure', selectData.value)
    }

    return {
      tab,
      userList,
      searchName,
      loadedRooms,
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
