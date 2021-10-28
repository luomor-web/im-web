<template>
  <im-drawer title="用户信息" @close="closeUserProfile" :visible="visible">
    <template #content="{}">
      <div class="d-table ma-auto">
        <v-hover>
          <template v-slot:default="{ hover }">
            <v-img
                aspect-ratio="1"
                height="150"
                width="150"
                class="header-img"
                :src="require('@/assets/images/default/account.svg')"
            >
              <v-fade-transition>
                <v-overlay
                    v-if="hover"
                    absolute
                >
                  <v-btn icon @click="openUpload" height="150" width="150">
                    <v-icon>{{ icons.mdiCamera }}</v-icon>
                  </v-btn>
                </v-overlay>
              </v-fade-transition>
            </v-img>
          </template>
        </v-hover>
      </div>
    </template>
  </im-drawer>
</template>

<script>
export default {
  name: "UserProfile",
  props: {
    visible: Boolean
  },
  setup(props, context) {

    const closeUserProfile = () => {
      context.emit('close')
    }
    const openUpload = () => {
      console.log('upload pic ')
    }

    return {
      openUpload,
      closeUserProfile
    }
  }
}
</script>

<style scoped>

</style>
