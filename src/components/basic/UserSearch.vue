<template>
  <v-text-field v-model="searchName"
                hide-details
                rounded
                dense
                filled
                clearable
                @change="change"
                placeholder="搜索"/>
</template>

<script>
import {onMounted, onUnmounted, ref} from "@vue/composition-api";
import msg from "@/plugins/msg";
import {searchUser} from "@/net/send-message";

export default {
  name: "UserSearch",
  props: {},
  setup(props, {emit}) {

    const searchName = ref('')

    onMounted(() => {
      msg.$on("COMMAND_SEARCH_USER_RESP", onSearchUserResp)
    })

    const onSearchUserResp = () => {

    }

    const change = (item) => {
      searchUser(item)
      emit('close')
    }

    onUnmounted(() => {
      msg.$off("COMMAND_SEARCH_USER_RESP")
    })


    return {
      searchName,

      change
    }
  }
}
</script>

<style scoped>

</style>
