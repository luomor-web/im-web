<template>
  <div style="height: 100vh">
    <drawer-top :sub="true" @close="close">
      <v-text-field hide-details rounded dense filled placeholder="搜索">
      </v-text-field>
    </drawer-top>
    <div class="mx-2">
      <v-list nav>
        <v-list-item v-ripple class="im-list-item" v-for="(item,index) of users" :key="index">
          <v-list-item-avatar>
            <v-img :src="item.avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.username }}</v-list-item-title>
          </v-list-item-content>

          <v-list-item-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on">
                  <v-icon>{{ icons.mdiShieldCrownOutline  }}</v-icon>
                </v-btn>
              </template>
              <span>设为管理员</span>
            </v-tooltip>
          </v-list-item-icon>

          <v-list-item-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on"
                       @click="removeRoom(item)">
                  <v-icon>{{ icons.mdiExitToApp  }}</v-icon>
                </v-btn>
              </template>
              <span>移出群聊</span>
            </v-tooltip>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<!--    <v-card flat>-->
<!--      <v-list dense>-->
<!--        <v-list-item-title class="font-weight-black">群组资料</v-list-item-title>-->
<!--        <v-list-item class="pa-2">-->
<!--          <v-list-item-content>-->
<!--            <div class="pb-3 d-flex flex-row flex-wrap">-->
<!--              <add-user-icon :title="'邀请'" @click="userSelectModelOpen"></add-user-icon>-->
<!--              <template v-for="(item,index) in room.users">-->
<!--                <div class="px-2 d-flex flex-column " :key="index">-->
<!--                  <v-menu-->
<!--                      :key="item._id"-->
<!--                      :close-on-content-click="false"-->
<!--                      bottom-->
<!--                      min-width="200px"-->
<!--                      rounded-->
<!--                      offset-y-->
<!--                      @input="resetActionData(500)"-->
<!--                  >-->
<!--                    <template v-slot:activator="{ on: menu, attrs }">-->
<!--                      <v-tooltip bottom>-->
<!--                        <template v-slot:activator="{ on: tooltip }">-->
<!--                          <v-btn-->
<!--                              icon-->
<!--                              x-large-->
<!--                              v-bind="attrs"-->
<!--                              v-on="{...menu,...tooltip}"-->
<!--                          >-->
<!--                            <v-badge-->
<!--                                :color="item.status.state === 'online' ? 'green':'red'"-->
<!--                                bordered-->
<!--                                bottom-->
<!--                                dot-->
<!--                                overlap-->
<!--                            >-->
<!--                              <v-avatar size="36" class="align-self-center">-->
<!--                                <v-img :src="item.avatar"></v-img>-->
<!--                              </v-avatar>-->
<!--                            </v-badge>-->
<!--                          </v-btn>-->
<!--                        </template>-->
<!--                        {{ item.role === 'ADMIN' ? '群主' : item.role === 'SUB_ADMIN' ? '管理员' : '成员' }}-->
<!--                      </v-tooltip>-->
<!--                    </template>-->
<!--                    <v-card>-->
<!--                      <v-list-item-content class="justify-center">-->
<!--                        <div class="mx-auto text-center">-->
<!--                          <v-avatar size="36" class="align-self-center mb-2">-->
<!--                            <v-img :src="item.avatar"></v-img>-->
<!--                          </v-avatar>-->
<!--                          <h4>{{ item.username }}</h4>-->
<!--                          <div v-if="canStartChat(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                @click="startChat(item)"-->
<!--                            >-->
<!--                              开始会话-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                          <div v-if="canRemoveRoom(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                v-if="!action.removeAction"-->
<!--                                @click="clickSureButton('removeAction')"-->
<!--                            >-->
<!--                              移出群聊-->
<!--                            </v-btn>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                color="error"-->
<!--                                v-else-->
<!--                                @click="removeRoom(item)"-->
<!--                            >-->
<!--                              确定移出吗-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                          <div v-if="canOutRoom(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                v-if="!action.outAction"-->
<!--                                @click="clickSureButton('outAction')"-->
<!--                            >-->
<!--                              退出群聊-->
<!--                            </v-btn>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                color="error"-->
<!--                                v-else-->
<!--                                @click="outRoom(item)"-->
<!--                            >-->
<!--                              确定退出吗-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                          <div v-if="canHandoverRoom(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                v-if="!action.handoverAction"-->
<!--                                @click="clickSureButton('handoverAction')"-->
<!--                            >-->
<!--                              移交群主-->
<!--                            </v-btn>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                color="error"-->
<!--                                v-else-->
<!--                                @click="handoverRoom(item)"-->
<!--                            >-->
<!--                              确定移交吗-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                          <div v-if="canDisbandRoom(item)">-->
<!--                            <v-divider class="my-3"></v-divider>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                v-if="!action.disbandAction"-->
<!--                                @click="clickSureButton('disbandAction')"-->
<!--                            >-->
<!--                              解散群聊-->
<!--                            </v-btn>-->
<!--                            <v-btn-->
<!--                                depressed-->
<!--                                rounded-->
<!--                                text-->
<!--                                color="error"-->
<!--                                v-else-->
<!--                                @click="disbandRoom()"-->
<!--                            >-->
<!--                              确定解散吗-->
<!--                            </v-btn>-->
<!--                          </div>-->
<!--                        </div>-->
<!--                      </v-list-item-content>-->
<!--                    </v-card>-->
<!--                  </v-menu>-->

<!--            </div>-->
<!--          </v-list-item-content>-->
<!--        </v-list-item>-->
<!--      </v-list>-->
<!--    </v-card>-->

<script>
import DrawerTop from "@/components/drawer/DrawerTop";
import {onMounted, ref, watch} from "@vue/composition-api";
import {mdiAccountCogOutline, mdiAccountRemoveOutline, mdiExitToApp, mdiShieldCrownOutline} from "@mdi/js";
import {removeUserGroup} from "@/net/message";

export default {

  name: "GroupUserManage",
  components: {
    DrawerTop
  },
  props: {
    room: {type: Object}
  },
  setup(props, {emit}) {

    const users = ref([])

    watch(() => props.room, room => {
      users.value = room.users
    })

    onMounted(() => {
      users.value = props.room.users
    })


    const removeRoom = (item) => {
      removeUserGroup({roomId: props.room.roomId, userId: item._id, type: 'REMOVE'})
    }


    const close = () => {
      emit('close', 'GROUP_EDIT')
    }

    return {
      users,
      removeRoom,
      close,

      icons: {
        mdiAccountCogOutline,
        mdiAccountRemoveOutline,
        mdiShieldCrownOutline,
        mdiExitToApp
      }
    }
  }
}
</script>

<style scoped>

</style>
