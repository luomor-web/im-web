<template>
  <div>
    <v-menu
        v-model="fab"
        :close-on-content-click="false"
        nudge-top="10"
        top
        left
        offset-y
        transition="scale-transition"
        origin="right bottom"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            class="mr-8 mb-16"
            color="blue darken-2"
            absolute
            dark
            bottom
            right
            fab
            v-bind="attrs"
            v-on="on"
        >
          <v-icon v-if="fab">
            {{icons.mdiClose}}
          </v-icon>
          <v-icon v-else>
            {{icons.mdiPencil}}
          </v-icon>
        </v-btn>
      </template>

      <v-card width="200" rounded="lg">
        <v-list>
          <v-list-item class="im-list-item" @click="goTo('ADD_CHAT')">
            <v-list-item-icon>
              <v-icon>
                {{ icons.mdiAccountOutline }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              添加会话
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="im-list-item" @click="goTo('CREATE_GROUP')">
            <v-list-item-icon>
              <v-icon>
                {{ icons.mdiAccountSupervisorOutline }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              创建群组
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>

</template>

<script>
import {ref} from "@vue/composition-api";
import {mdiAccountOutline, mdiAccountSupervisorOutline, mdiClose, mdiPencil} from "@mdi/js";

export default {
  name: "FloatMenu",
  props: {},
  setup(props, {emit}) {

    const fab = ref(false)

    const goTo = item => {
      emit('close', item)
    }

    return {
      fab,
      goTo,

      icons: {
        mdiAccountSupervisorOutline,
        mdiAccountOutline,
        mdiPencil,
        mdiClose,
      }
    }

  }
}
</script>

<style scoped>

</style>
