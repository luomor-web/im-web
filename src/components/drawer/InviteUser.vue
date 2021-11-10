<template>
  <im-drawer title="创建群组" @close="closeInviteUser" :direction="true" :visible="visible">
    <template #content="{}">
      <div class="pb-3" :class="{'mt-9':userSelect.length===0}">
        <template v-for="(item,index) in userSelect">
          <v-tooltip :key="index" top>
            <template v-slot:activator="{ on, attrs }">
              <div class="px-1 d-inline">
                <v-avatar size="36" v-bind="attrs"
                          v-on="on" @click="removeUser(item)">
                  <v-img :src="item.avatar"></v-img>
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
      <div class="overflow-y-auto pt-3" style="max-height: calc(100vh - 168px)">
        <v-list>
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
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {ref, watch} from "@vue/composition-api";
import {mdiArrowRight, mdiCamera, mdiChatOutline, mdiMagnify, mdiTicketAccount} from "@mdi/js";

export default {
  name: "InviteUser",
  props: {
    visible: Boolean,
    users: Array,
  },
  components: {
    ImDrawer
  },
  setup(props, context) {
    console.log(props, context)

    const userSelect = ref([])
    const userSelectIndex = ref([])
    const waitSelect = ref([])

    watch(() => props.users, (users) => {
      waitSelect.value = [...users]
    })

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

    const clearData = () => {
      waitSelect.value = []
      userSelect.value = []
      userSelectIndex.value = []
    }

    const closeInviteUser = () => {
      context.emit('close')
      clearData()
    }

    return {
      closeInviteUser,
      userSelect,
      userSelectIndex,
      removeUser,
      operationUser,
      waitSelect,

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

<style scoped>

</style>
