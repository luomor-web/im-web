<template>
  <div>
    <div v-if="isElectron">
      <top-bar />
    </div>
    <div class="auth-wrapper auth-v1">
      <div class="auth-inner">
        <v-stepper v-model="el">
          <v-stepper-header class="mb-3">
            <v-stepper-step step="1">
              用户名
            </v-stepper-step>
            <v-divider />

            <v-stepper-step step="2">
              问题验证
            </v-stepper-step>

            <v-divider />

            <v-stepper-step step="3">
              重置
            </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card
                class="mb-6"
                color="lighten-1"
              >
                <v-card-text>
                  <v-form ref="from">
                    <v-text-field
                      v-model="forgotFrom.account"
                      outlined
                      label="登录账号"
                      placeholder="登录账号"
                      :rules="rules.account"
                      hide-details="auto"
                      class="mb-3"
                    />
                  </v-form>
                </v-card-text>
                <v-btn
                  block
                  color="primary"
                  :loading="loading"
                  @click="accountBlur"
                >
                  下一步
                </v-btn>
              </v-card>

              <!-- create new account  -->
              <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
                  <span class="me-2">
                    想再试试?
                  </span>
                <router-link :to="{name:'Login'}">
                  返回登录
                </router-link>
              </v-card-text>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-card
                class="mb-6"
                color="lighten-1"
              >
                <v-card-text>
                  <v-form ref="fromQuestion">
                    <v-select
                      v-model="forgotFrom.question"
                      :items="questions"
                      item-text="value"
                      item-value="id"
                      label="安全问题"
                      outlined
                    />
                    <v-text-field
                      v-model="forgotFrom.answer"
                      outlined
                      label="答案"
                      placeholder="答案"
                      :rules="rules.answer"
                      hide-details="auto"
                      class="mb-3"
                    />
                  </v-form>
                </v-card-text>
                <v-btn
                  block
                  :loading="loading"
                  color="primary"
                  @click="checkQuestion"
                >
                  下一步
                </v-btn>
              </v-card>

              <!-- create new account  -->
              <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
                  <span class="me-2">
                    想再试试?
                  </span>
                <router-link :to="{name:'Login'}">
                  返回登录
                </router-link>
              </v-card-text>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-card
                class="mb-6"
                color="lighten-1"
              >
                <v-card-text>
                  <v-form ref="fromReset">
                    <v-text-field
                      v-model="forgotFrom.password"
                      type="password"
                      outlined
                      label="密码"
                      placeholder="密码"
                      :rules="rules.password"
                      hide-details="auto"
                      class="mb-3"
                    />

                    <v-text-field
                      v-model="forgotFrom.repeatPassword"
                      type="password"
                      outlined
                      label="重复密码"
                      placeholder="重复密码"
                      :rules="rules.repeatPassword"
                      hide-details="auto"
                    />
                  </v-form>
                </v-card-text>
                <v-btn
                  block
                  color="primary"
                  :loading="loading"
                  @click="resetPassword"
                >
                  完成
                </v-btn>
              </v-card>

              <!-- create new account  -->
              <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
                  <span class="me-2">
                    想再试试?
                  </span>
                <router-link :to="{name:'Login'}">
                  返回登录
                </router-link>
              </v-card-text>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
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
import { checkAccountAuth, checkAccountQuestion, reset } from '@/net/api'
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
    const fromReset = ref(null)
    const el = ref(1)
    const loading = ref(false)
    const snackbar = ref({
      display: false,
      text: ''
    })
    const forgotFrom = ref({
      answer: '',
      question: 'CITY',
      account: '',
      password: '',
      repeatPassword: ''
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
      password: [
        v => !!v || '密码必填',
        v => v.length <= 16 || '密码不能超过16个字符'
      ],
      repeatPassword: [
        v => !!v || '重复密码必填',
        v => v.length <= 16 || '重复密码不能超过16个字符',
        v => v === forgotFrom.value.password || '重复密码与密码不相同'
      ]
    })

    const resetPassword = () => {
      if (!fromReset.value.validate()) {
        return
      }
      loading.value = true
      reset(forgotFrom.value).then(response => {
        loading.value = false
        if (response.success) {
          from.value.reset()
          fromQuestion.value.reset()
          fromReset.value.reset()
          router.push('/login')
        } else {
          snackbar.value.display = true
          snackbar.value.text = response.msg
        }
      })
    }

    const checkQuestion = () => {
      if (!fromQuestion.value.validate()) {
        return
      }
      loading.value = true
      checkAccountQuestion({ account: forgotFrom.value.account, question: forgotFrom.value.question, answer: forgotFrom.value.answer }).then(response => {
        loading.value = false
        if (response.success) {
          el.value = 3
        } else {
          snackbar.value.display = true
          snackbar.value.text = response.msg
        }
      })
    }

    const accountBlur = () => {
      if (!from.value.validate()) {
        return
      }
      loading.value = true
      checkAccountAuth({ account: forgotFrom.value.account }).then(response => {
        loading.value = false
        if (response.success) {
          snackbar.value.display = true
          snackbar.value.text = '该账号不存在'
        } else {
          el.value = 2
        }
      })
    }

    return {
      el,
      from,
      fromQuestion,
      fromReset,
      forgotFrom,
      rules,
      snackbar,
      loading,
      questions,

      accountBlur,
      checkQuestion,
      resetPassword,

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
