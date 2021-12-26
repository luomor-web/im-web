<template>
  <div style="height: 100%" class="overflow-y-auto">
    <v-list nav>
      <v-list-item v-ripple v-for="(item,index) of filteredItems" :key="index" >
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
import {computed} from "@vue/composition-api";

export default {
  name: "UserSelectColumn",
  props: {
    filters: {
      type: Array, default: () => {
        return []
      }
    }
  },
  setup(props, {emit}) {

    const clickContent = (item) => {
      emit('click-content', item)
    }

    const filteredItems = computed(() => {
      return waitSelectUser.value.filter(x => props.filters.findIndex(r => r._id === x._id) === -1)
    })

    // 是否在拦截元素中
    const isFilter = (item) => {
      return props.filters.findIndex(r => r._id === item._id) !== -1;
    }

    return {
      filteredItems,
      isFilter,
      clickContent,
      waitSelectUser
    }
  }
}
</script>

<style scoped>

</style>
