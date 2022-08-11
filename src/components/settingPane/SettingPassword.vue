<template>
<div>
  <drawer-top title="修改密码" :sub="true" @close="open('SETTING_ITEM')" />
  <v-form ref="from">
    <v-text-field
      v-model="passwordFrom.oldPassword"
      label="旧密码"
      hide-details="auto"
      :rules="rules.oldPassword"
      class="mb-3 mx-3"
      outlined
    />
    <v-text-field
      v-model="passwordFrom.password"
      type="password"
      label="新密码"
      hide-details="auto"
      :rules="rules.password"
      class="mb-3 mx-3"
      outlined
    />
    <v-text-field
      v-model="passwordFrom.repeatPassword"
      type="password"
      label="重复密码"
      :rules="rules.repeatPassword"
      hide-details="auto"
      class="mb-3 mx-3"
      outlined
    />
  </v-form>
  <v-fab-transition>
    <v-btn
      v-show="showSure"
      class="mb-16 mr-8"
      absolute
      fab
      right
      bottom
      color="success"
      @click="changePassword(null)"
    >
      <v-icon>{{ icons.mdiCheck }}</v-icon>
    </v-btn>
  </v-fab-transition>
</div>
</template>

<script>
import DrawerTop from '@/components/basic/DrawerTop'
import store from '@/store'
import { inject, onMounted, onUnmounted, ref, watch } from '@vue/composition-api'
import { mdiCheck } from '@mdi/js'
import { setNewPassword } from '@/net/send-message'
import msg from '@/plugins/msg'

export default {
  name: 'SettingPassword',
  components: {
    DrawerTop
  },
  setup() {
    const showSure = ref(false)
    const from = ref(null)
    const passwordFrom = ref({
      oldPassword: '',
      password: '',
      repeatPassword: ''
    })
    const rules = ref({
      oldPassword: [
        v => !!v || '旧的密码必填',
        v => (v && v.length <= 16) || '密码必填超过16个字符'
      ],
      password: [
        v => !!v || '密码必填',
        v => (v && v.length <= 16) || '密码不能超过16个字符'
      ],
      repeatPassword: [
        v => !!v || '重复密码必填',
        v => (v && v.length <= 16) || '重复密码不能超过16个字符',
        v => (v && v === passwordFrom.value.password) || '重复密码与密码不相同'
      ]
    })
    // 提示框
    const snackbar = ref({
      display: false,
      text: '',
      timeout: 1000
    })
    const imComponent = inject('imComponent', () => {})
    onMounted(() => {
      msg.$on('COMMAND_SET_NEW_PASSWORD_RESP', (data) => {
        if (data.success) {
          snackbar.value.text = '修改成功'
          snackbar.value.display = true
          imComponent.value.tip(snackbar.value)
          open('SETTING_ITEM')
        } else {
          snackbar.value.text = data.msg
          snackbar.value.display = true
          imComponent.value.tip(snackbar.value)
        }
      })
    })
    onUnmounted(() => {
      msg.$off('COMMAND_SET_NEW_PASSWORD_RESP')
    })
    watch(passwordFrom, (val) => {
      showSure.value = !!(val.password && val.oldPassword && val.repeatPassword && from.value.validate())
    }, { deep: true })
    const open = (item) => {
      from.value.reset()
      store.commit('setSettingPane', item)
    }
    const changePassword = () => {
      setNewPassword(passwordFrom.value)
    }
    return {
      showSure,
      from,
      open,
      rules,
      passwordFrom,
      changePassword,

      icons: {
        mdiCheck
      }
    }
  }
}
</script>

<style scoped>

</style>
