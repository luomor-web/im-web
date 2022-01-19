<template>
  <div>
    <div v-if="isElectron">
      <top-bar></top-bar>
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
                  :src="require('@/assets/images/logos/logo.svg')"
                  max-height="30px"
                  max-width="30px"
                  alt="logo"
                  contain
                  class="me-3 "
              ></v-img>

              <h2 class="text-2xl font-weight-semibold">
                Courier
              </h2>
            </router-link>
          </v-card-title>

          <!-- title -->
          <v-card-text>
            <p class="text-2xl font-weight-semibold text--primary mb-2">
              欢迎来到信使 Welcome to Courier! 👋🏻
            </p>
          </v-card-text>

          <!-- login form -->
          <v-card-text>
            <v-form>
              <v-text-field
                  v-model="username"
                  outlined
                  label="用户名"
                  placeholder="用户名"
                  hide-details
                  class="mb-3"
              ></v-text-field>

              <v-text-field
                  v-model="password"
                  outlined
                  :type="isPasswordVisible ? 'text' : 'password'"
                  label="密码"
                  placeholder="············"
                  :append-icon="isPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                  hide-details
                  @click:append="isPasswordVisible = !isPasswordVisible"
              ></v-text-field>

              <div class="d-flex align-center justify-space-between flex-wrap">
                <v-checkbox
                    v-model="remember"
                    label="记住密码"
                    hide-details
                    class="me-3 mt-1"
                >
                </v-checkbox>

                <!-- forgot link -->
                <a
                    @click="forgotPassword"
                    class="mt-1"
                >
                  忘记密码
                </a>
              </div>

              <v-btn
                  block
                  color="primary"
                  class="mt-6"
                  @click="login"
              >
                登录
              </v-btn>
            </v-form>
          </v-card-text>

          <!-- create new account  -->
          <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
          <span class="me-2">
            体验新功能?
          </span>
            <router-link :to="{name:'Register'}">
              创建账号
            </router-link>
          </v-card-text>
        </v-card>
      </div>

      <!-- background triangle shape  -->
      <img
          class="auth-mask-bg"
          height="173"
          :src="require(`@/assets/images/misc/mask-${$vuetify.theme.dark ? 'dark':'light'}.png`)"
      >

      <!-- tree -->
      <v-img
          class="auth-tree"
          width="247"
          height="185"
          src="@/assets/images/misc/tree.png"
      ></v-img>

      <!-- tree  -->
      <v-img
          class="auth-tree-3"
          width="377"
          height="289"
          src="@/assets/images/misc/tree-3.png"
      ></v-img>
    </div>

    <v-snackbar
        v-model="snackbar.display"
    >
      {{ snackbar.text }}

      <template v-slot:action="{ attrs }">
        <v-btn
            color="pink"
            text
            v-bind="attrs"
            @click="snackbar.display = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import TopBar from "../components/system/TopBar";
import {mdiEyeOffOutline, mdiEyeOutline} from '@mdi/js'
import {onMounted, ref} from '@vue/composition-api'
import {close, startWebSocket} from "@/net/socket";
import msg from '@/plugins/msg'
import router from "@/router";
import localStoreUtil from "@/utils/local-store";

export default {

  name: "Login",
  components: {
    TopBar
  },
  setup() {

    let isElectron = ref(process.env.IS_ELECTRON);

    const isPasswordVisible = ref(false)
    const username = ref('')
    const password = ref('')
    const remember = ref(false)

    const snackbar = ref({
      display: false,
      text: ''
    })

    const login = () => {
      startWebSocket(username.value, password.value)
    }

    onMounted(() => {
      const value = localStoreUtil.getValue('username');
      if (value) {
        username.value = value
      }
      const pwd = localStoreUtil.getValue('password');
      if (pwd) {
        remember.value = true
        password.value = pwd
      }
      msg.$on("COMMAND_LOGIN_RESP", (data) => {
        if (data.success) {
          localStoreUtil.setValue('token', '123456')
          localStoreUtil.setValue('username', username.value)
          localStoreUtil.setValue('userId', data.data._id)
          if (remember.value) {
            localStoreUtil.setValue('password', password.value)
          }
          router.push('/')
        }else {
          snackbar.value.display = true
          snackbar.value.text = data.msg
          close()
        }
      })
    })

    const forgotPassword = () => {

    }

    const pageHeight = isElectron ? 'calc(100vh - 48px)' : '100vh'

    return {
      isPasswordVisible,
      username,
      password,
      remember,
      snackbar,

      login,
      forgotPassword,

      icons: {
        mdiEyeOutline,
        mdiEyeOffOutline,
      },

      pageHeight,
      isElectron
    }
  }

}
</script>

<style lang="scss" scoped>
@import '~@/plugins/auth.scss';
</style>
