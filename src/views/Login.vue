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
                Materio
              </h2>
            </router-link>
          </v-card-title>

          <!-- title -->
          <v-card-text>
            <p class="text-2xl font-weight-semibold text--primary mb-2">
              Welcome to Materio! 👋🏻
            </p>
          </v-card-text>

          <!-- login form -->
          <v-card-text>
            <v-form>
              <v-text-field
                  v-model="username"
                  outlined
                  label="用户名"
                  placeholder="a"
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
                    label="Remember Me"
                    hide-details
                    class="me-3 mt-1"
                >
                </v-checkbox>

                <!-- forgot link -->
                <a
                    href="javascript:void(0)"
                    class="mt-1"
                >
                  Forgot Password?
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
            New on our platform?
          </span>
            <router-link :to="{name:'Home'}">
              Create an account
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
  </div>
</template>

<script>
import TopBar from "../components/TopBar";
import { mdiFacebook, mdiTwitter, mdiGithub, mdiGoogle, mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js'
import { ref } from '@vue/composition-api'
import {webSocket} from "@/net/socket";
import msg from '@/plugins/msg'
import router from "@/router";
import localStoreUtil from "@/utils/localStoreUtil";

export default {

  name: "Login",
  components:{
    TopBar
  },
  setup(){
    let isElectron = ref(process.env.IS_ELECTRON);

    const isPasswordVisible = ref(false)
    const username = ref('')
    const password = ref('')
    const socialLink = [
      {
        icon: mdiFacebook,
        color: '#4267b2',
        colorInDark: '#4267b2',
      },
      {
        icon: mdiTwitter,
        color: '#1da1f2',
        colorInDark: '#1da1f2',
      },
      {
        icon: mdiGithub,
        color: '#272727',
        colorInDark: '#fff',
      },
      {
        icon: mdiGoogle,
        color: '#db4437',
        colorInDark: '#db4437',
      },
    ]

    const login = () => {
      webSocket(username.value, password.value)
    }

    const init = () => {
      const value = localStoreUtil.getValue('username');
      if(value){
        username.value = value
      }
      msg.$on("COMMAND_LOGIN_RESP",(data) => {
        if(data.success) {
          localStoreUtil.setValue('token','123456')
          localStoreUtil.setValue('username',username.value)
          localStoreUtil.setValue('userId',data.data._id)
          router.push('/')
        }
      })
    }

    init()

    const pageHeight = isElectron ?  'calc(100vh - 48px)' : '100vh'

    return {
      isPasswordVisible,
      username,
      password,
      socialLink,

      login,

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
