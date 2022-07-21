import Vue from 'vue'
import App from './App.vue'
import './plugins/compositionApi'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { initWebSocket } from './net/socket'

import moment from 'moment'
Vue.prototype.$moment = moment
moment.locale('zh-cn')

Vue.config.productionTip = false
initWebSocket()
new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
