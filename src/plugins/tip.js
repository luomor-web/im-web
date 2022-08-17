import Vuetify from 'vuetify'
import Vue from 'vue'
import ImSnackbar from '@/components/basic/ImSnackbar'

Vue.use(Vuetify)

const v = new Vue({
  render(createElement) {
    return createElement(ImSnackbar)
  },
  vuetify: new Vuetify()
})

v.$mount()
document.body.appendChild(v.$el)
const snackbar = v.$children[0]

function info(msg, timeout) {
  snackbar.info(msg, timeout)
}

export default {
  info
}
