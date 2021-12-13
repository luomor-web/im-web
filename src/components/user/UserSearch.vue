<template>
  <div style="width: 100%">
    <v-text-field v-model="searchName" hide-details rounded dense filled placeholder="搜索">
    </v-text-field>

    <v-menu v-model="showCard" offset-y bottom absolute :position-x="52" :position-y="58">
      <v-card width="100%">
        <v-card-title>212313</v-card-title>
      </v-card>
    </v-menu>

  </div>
</template>

<script>
import {onMounted, ref, watch} from "@vue/composition-api";
import {waitSelectUser} from "@/views/home/home";

export default {
  name: "UserSearch",
  props: {
    waitSelect: Array,
  },
  setup() {

    const showCard = ref(false)
    const searchName = ref('')

    watch(() => searchName.value , searchName => {
      showCard.value = !!searchName
    })

    const searchChange = item => {
      console.log(item)
      if(item){
        showCard.value = true
      }
    }

    onMounted(() => {

    })

    return {
      showCard,
      searchName,
      searchChange,
      waitSelectUser
    }
  }
}
</script>

<style scoped>

</style>