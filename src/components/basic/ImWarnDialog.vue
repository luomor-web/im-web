<template>
  <v-dialog v-model="action.model" width="350">
    <v-card>
      <v-card-title class="text-h6">
        {{action.title}}
      </v-card-title>

      <v-card-text>
        {{action.content}}
      </v-card-text>

      <v-card-actions>
        <v-spacer/>
        <v-btn
            color="green darken-1"
            text
            @click="cancel"
        >
          取消
        </v-btn>

        <v-btn
            color="green darken-1"
            text
            @click="sure"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ImWarnDialog",
  props: {
    action: Object,
  },
  setup(props) {

    const cancel = () => {
      props.action.cancel()
    }

    const sure = () => {
      props.action.sure()
    }

    return {
      sure,
      cancel
    }
  }
}
</script>

<style scoped>

</style>
