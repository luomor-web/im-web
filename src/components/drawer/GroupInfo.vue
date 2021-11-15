<template>
  <div>
    <im-drawer title="群组信息" @close="closeGroupInfo" :visible="visible" :direction="true"
               :temporary="drawerTemporary">
      <template #content="{}">
        <v-card flat>
          <div class="d-table ma-auto">
            <v-img
                aspect-ratio="1"
                height="150"
                width="150"
                class="header-img"
                :src="room.avatar"
            >
            </v-img>
          </div>
          <v-card-title class="d-table ma-auto text-h5">{{ room.roomName }}</v-card-title>
        </v-card>
        <v-card flat>
          <v-list dense>
            <v-list-item-title class="font-weight-black">群组资料</v-list-item-title>
            <!--            <v-subheader>群组成员</v-subheader>-->
            <v-list-item class="pa-2">
              <!--                <v-list-item-icon>
                                <v-icon v-text="mdiIceCream"></v-icon>
                              </v-list-item-icon>-->
              <v-list-item-content>
                <div class="pb-3 d-flex flex-row flex-wrap">
                  <template v-for="(item,index) in room.users">
                    <div class="px-2 d-flex flex-column " :key="index">
                      <v-menu
                          bottom
                          min-width="200px"
                          rounded
                          offset-y
                      >
                        <template v-slot:activator="{ on }">
                          <v-btn
                              icon
                              x-large
                              v-on="on"
                          >
                            <v-badge
                                :color="item.status.state === 'online' ? 'green':'red'"
                                bordered
                                bottom
                                dot
                                overlap
                            >
                              <v-avatar size="36" class="align-self-center">
                                <v-img :src="item.avatar"></v-img>
                              </v-avatar>
                            </v-badge>
                          </v-btn>
                        </template>
                        <v-card>
                          <v-list-item-content class="justify-center">
                            <div class="mx-auto text-center">
                              <v-avatar size="36" class="align-self-center mb-2">
                                <v-img :src="item.avatar"></v-img>
                              </v-avatar>
                              <h4>{{ item.username }}</h4>
                              <v-divider class="my-3"></v-divider>
                              <v-btn
                                  depressed
                                  rounded
                                  text
                                  @click="startChat(item)"
                              >
                                开始会话
                              </v-btn>
                              <v-divider class="my-3"></v-divider>
                              <v-btn
                                  depressed
                                  rounded
                                  text
                                  color="error"
                                  v-if="curUserId !== item._id"
                                  @click="removeRoom(item)"
                              >
                                移出群聊
                              </v-btn>
                              <v-btn
                                  depressed
                                  rounded
                                  text
                                  color="error"
                                  v-if="curUserId === item._id"
                              >
                                退出群聊
                              </v-btn>
                            </div>
                          </v-list-item-content>
                        </v-card>
                      </v-menu>

                      <span class="subtitle-2 align-self-center">
                        {{ item.username.length > 3 ? item.username.substring(0, 3) + '..' : item.username }}
                      </span>
                    </div>
                  </template>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </template>
    </im-drawer>
  </div>
</template>

<script>
import ImDrawer from "@/components/drawer/ImDrawer";
import {ref} from "@vue/composition-api";
import localStoreUtil from "@/utils/local-store";
import {removeUserGroup} from "@/net/message";

export default {
  name: "GroupInfo",
  props: {
    visible: Boolean,
    room: Object
  },
  components: {
    ImDrawer
  },
  setup(props, context) {
    const drawerTemporary = ref(true)
    const closeGroupInfo = () => {
      context.emit('close')
    }

    const curUserId = ref(localStoreUtil.getValue('userId'))

    const removeRoom = (item) => {
      removeUserGroup({roomId: props.room.roomId, userId: item._id})
    }

    const startChat = (item) => {
      context.emit('chat',item)
    }

    return {
      curUserId,
      drawerTemporary,
      closeGroupInfo,
      removeRoom,
      startChat,
    }
  }
}
</script>

<style lang="scss" scoped>

@import "../../styles/theme";

.header-img {
  border-radius: 150px;
  background-color: $v-grey-lighten1;
}

</style>
