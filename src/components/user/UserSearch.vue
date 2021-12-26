<template>
  <div style="width: 100%">
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-text-field v-model="searchName"
                      hide-details
                      rounded
                      dense
                      filled
                      v-bind="attrs"
                      v-on="on"
                      clearable
                      placeholder="搜索">
        </v-text-field>
      </template>
      <v-card max-height="400">
        <v-list nav>
          <v-list-item v-ripple v-for="(item,index) of filteredItems" :key="index" class="im-list-item"
                       @click="selectItem(item)">
            <v-list-item-avatar>
              <v-img :src="item.avatar"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ item.username }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <slot name="userAction" :item="item">
              </slot>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

  </div>
</template>

<script>
import {computed, onMounted, ref} from "@vue/composition-api";
import {waitSelectUser} from "@/views/home/home";

export default {
  name: "UserSearch",
  props: {
    waitSelect: Array,
    filters: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  setup(props, {emit}) {

    const searchName = ref('')

    const filteredItems = computed(() => {
      console.log('search', searchName)
      return waitSelectUser.value.filter(x => x.username.indexOf(searchName.value) !== -1 && props.filters.findIndex(r => r._id === x._id) === -1)
    })

    const customFilter = (item, queryText, itemText) => {
      console.log(itemText)
      const username = item.username.toLowerCase()
      const searchText = queryText.toLowerCase()

      return username.indexOf(searchText) > -1
    }

    const selectItem = (item) => {
      emit('click-content', item)
    }

    onMounted(() => {

    })

    return {
      selectItem,
      filteredItems,
      customFilter,
      searchName,
      waitSelectUser
    }
  }
}
</script>

<style scoped>

</style>
