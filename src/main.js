import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import VueCompositionApi from '@vue/composition-api'
import {initWebSocket} from './net/socket'

import moment from 'moment'
Vue.prototype.$moment = moment
moment.locale('zh-cn')

Vue.use(VueCompositionApi)

Vue.config.productionTip = false
initWebSocket()
new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
