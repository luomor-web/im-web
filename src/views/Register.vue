<template>
  <div>
    <div v-if="isElectron">
      <top-bar />
    </div>
    <div class="auth-wrapper auth-v1">
      <div class="auth-inner">
        <v-card class="auth-card">
          <!-- logo -->
          <v-card-title class="d-flex align-center justify-center py-7">
            <router-link
                to="/"
                class="d-flex align-center"
            >
              <v-img
                  :src="require('@/assets/images/logos/logo.png')"
                  max-height="30px"
                  max-width="30px"
                  alt="logo"
                  contain
                  class="me-3 "
              />

              <h2 class="text-2xl font-weight-semibold">
                Courier
              </h2>
            </router-link>
          </v-card-title>
          <v-stepper v-model="el" elevation="0" non-linear>
            <v-stepper-header>
              <v-stepper-step step="1" editable>
               账户信息
              </v-stepper-step>

              <v-divider />

              <v-stepper-step step="2">
                验证信息
              </v-stepper-step>
            </v-stepper-header>
            <!-- login form -->
            <v-stepper-items>
              <v-stepper-content step="1">
                <v-card-text>
                  <v-form ref="from">
                    <v-text-field
                      v-model="registerFrom.account"
                      outlined
                      label="登录账号"
                      placeholder="登录账号"
                      :rules="rules.account"
                      hide-details="auto"
                      class="mb-3"
                      :loading="checkAccount.loading"
                      @blur="accountBlur"
                    >
                      <template v-if="checkAccount.displayIcon" #append>
                        <v-tooltip
                          bottom
                        >
                          <template #activator="{ on }">
                            <v-icon v-on="on">
                              {{ checkAccount.success ? icons.mdiCheckCircleOutline : icons.mdiCloseCircleOutline }}
                            </v-icon>
                          </template>
                          {{ checkAccount.tip }}
                        </v-tooltip>
                      </template>
                    </v-text-field>

                    <v-text-field
                      v-model="registerFrom.username"
                      outlined
                      label="用户名"
                      placeholder="用户名"
                      :rules="rules.username"
                      hide-details="auto"
                      class="mb-3"
                    />

                    <v-text-field
                      v-model="registerFrom.password"
                      type="password"
                      outlined
                      label="密码"
                      placeholder="密码"
                      :rules="rules.password"
                      hide-details="auto"
                      class="mb-3"
                    />

                    <v-text-field
                      v-model="registerFrom.repeatPassword"
                      type="password"
                      outlined
                      label="重复密码"
                      placeholder="重复密码"
                      :rules="rules.repeatPassword"
                      hide-details="auto"
                    />

                    <v-btn
                      block
                      color="primary"
                      class="mt-6"
                      @click="next"
                    >
                      下一步
                    </v-btn>
                  </v-form>
                </v-card-text>
              </v-stepper-content>
              <v-stepper-content step="2">
                <v-card-text>
                    <v-form ref="fromQuestion">
                      <v-select
                        v-model="registerFrom.question"
                        :items="questions"
                        item-text="value"
                        item-value="id"
                        label="安全问题"
                        outlined
                      />
                      <v-text-field
                        v-model="registerFrom.answer"
                        outlined
                        label="答案"
                        placeholder="答案"
                        :rules="rules.answer"
                        hide-details="auto"
                        class="mb-3"
                      />
                    </v-form>
                    <v-btn
                      block
                      color="primary"
                      class="mt-6"
                      @click="register"
                    >
                      确定
                    </v-btn>
                </v-card-text>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>

          <!-- create new account  -->
          <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
          <span class="me-2">
            已有账号?
          </span>
            <router-link :to="{name:'Login'}">
              返回登录
            </router-link>
          </v-card-text>
        </v-card>
      </div>

      <!-- background triangle shape  -->
      <img
          class="auth-mask-bg"
          height="173"
          :src="require(`@/assets/images/misc/mask-${$vuetify.theme.dark ? 'dark':'light'}.png`)"
      />

      <!-- tree -->
      <v-img
          class="auth-tree"
          width="247"
          height="185"
          src="@/assets/images/misc/tree.png"
      />

      <!-- tree  -->
      <v-img
          class="auth-tree-3"
          width="377"
          height="289"
          src="@/assets/images/misc/tree-3.png"
      />
    </div>
    <im-tip :snackbar="snackbar" @close="snackbar.display = false" />
  </div>
</template>

<script>
import ImTip from '@/components/basic/ImTip'
import TopBar from '../components/basic/TopBar'
import { mdiCheckCircleOutline, mdiCloseCircleOutline, mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js'
import { ref } from '@vue/composition-api'
import { checkAccountAuth, registerUser } from '@/net/api'
import router from '@/router'
import { questions } from '@/locales/account-questions'

export default {

  name: 'Register',
  components: {
    TopBar,
    ImTip
  },
  setup() {
    const isElectron = ref(process.env.IS_ELECTRON)
    const from = ref(null)
    const fromQuestion = ref(null)
    const el = ref(1)
    const snackbar = ref({
      display: false,
      text: ''
    })
    const registerFrom = ref({
      account: '',
      username: '',
      password: '',
      repeatPassword: '',
      question: '',
      answer: ''
    })

    const checkAccount = ref({
      loading: false,
      tip: '',
      displayIcon: false,
      success: false
    })

    const rules = ref({
      account: [
        v => !!v || '登录账号必填',
        v => v.length <= 10 || '登录账号不能超过十个字符'
      ],
      answer: [
        v => !!v || '答案必填',
        v => v.length <= 16 || '用户名不能超过十六字符'
      ],
      username: [
        v => !!v || '用户名必填',
        v => v.length <= 10 || '用户名不能超过十个字符'
      ],
      password: [
        v => !!v || '密码必填',
        v => v.length <= 16 || '密码不能超过16个字符'
      ],
      repeatPassword: [
        v => !!v || '重复密码必填',
        v => v.length <= 16 || '重复密码不能超过16个字符',
        v => v === registerFrom.value.password || '重复密码与密码不相同'
      ]
    })

    const next = () => {
      if (!from.value.validate()) return
      if (!checkAccount.value.success) {
        snackbar.value.display = true
        snackbar.value.text = '账号不可用'
        return
      }
      el.value = 2
    }

    const register = () => {
      const validate = from.value.validate()
      if (!validate) return

      registerUser(registerFrom.value).then(response => {
        snackbar.value.text = response.msg
        snackbar.value.display = true
        if (response.success) {
          from.value.reset()
          router.push('/login')
        }
      })
    }

    const accountBlur = () => {
      if (!registerFrom.value.account) {
        checkAccount.value = {
          loading: false,
          tip: '',
          displayIcon: false,
          success: false
        }
        return
      }
      checkAccount.value.loading = true
      checkAccountAuth({ account: registerFrom.value.account }).then(response => {
        checkAccount.value.loading = false
        if (response.success) {
          checkAccount.value.success = true
          checkAccount.value.tip = '该登录账号可以使用'
        } else {
          checkAccount.value.success = false
          checkAccount.value.tip = '该登录账号已存在'
        }
        checkAccount.value.displayIcon = true
      })
    }

    return {
      el,
      from,
      next,
      registerFrom,
      fromQuestion,
      checkAccount,
      rules,
      snackbar,
      questions,

      register,
      accountBlur,

      icons: {
        mdiEyeOutline,
        mdiEyeOffOutline,
        mdiCheckCircleOutline,
        mdiCloseCircleOutline
      },

      isElectron
    }
  }

}
</script>

<style lang="scss" scoped>
@import '~@/plugins/auth.scss';
</style>
