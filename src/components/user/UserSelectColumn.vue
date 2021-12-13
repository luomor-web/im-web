<template>
  <div>
    <v-list nav>
      <v-list-item v-ripple class="im-list-item" v-for="(item,index) of waitSelectUser" :key="index">
        <v-list-item-avatar>
          <v-img :src="item.avatar"></v-img>
        </v-list-item-avatar>
        <v-list-item-content @click="clickContent(item)">
          <v-list-item-title>{{ item.username }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <slot name="userAction" :item="item">
          </slot>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import {waitSelectUser} from "@/views/home/home";

export default {
  name: "UserSelectColumn",
  setup(props, {emit}) {
    const clickContent = (item) => {
      emit('click-content', item)
    }

    return {
      clickContent,
      waitSelectUser
    }
  }
}
</script>

<style scoped>

</style>