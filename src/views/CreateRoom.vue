<template>
<div>
  <div v-if="isElectron">
    <top-bar :isChild="true"></top-bar>
  </div>
  <div class="create-room-content">
    123
  </div>
</div>
</template>

<script>
import {ref} from "@vue/composition-api";
import TopBar from "@/components/TopBar";

export default {
  name: "CreateRoom",
  components:{
    TopBar
  },

  setup(){
    let isElectron = ref(process.env.IS_ELECTRON)

    return {
      isElectron
    }
  }
}
</script>

<style scoped>
.create-room-content{
  height: calc(100vh - 32px);
}
</style>
