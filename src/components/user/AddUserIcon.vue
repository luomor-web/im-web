<template>
  <div class="px-2 d-flex flex-column">
    <div class="align-center header">
      <div class="header-line" @click="click">
        <v-icon>{{ icons.mdiPlus }}</v-icon>
      </div>
    </div>
    <span class="subtitle-2 align-self-center text--secondary">
       {{ title }}
    </span>
  </div>
</template>

<script>
import {mdiPlus} from "@mdi/js";

export default {
  name: "AddUserIcon",
  props: {
    title: String,
  },
  setup(props, context) {

    const click = () => {
      context.emit('click')
    }

    return {
      click,

      icons: {
        mdiPlus
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.header {
  width: 52px;
  height: 52px;
  display: flex;
  justify-content: center;
  cursor: pointer;

  .header-line {
    width: 36px;
    height: 36px;
    border-radius: 36px;
    border: 1px dashed;
    display: flex;
    justify-content: center;
  }
}

</style>