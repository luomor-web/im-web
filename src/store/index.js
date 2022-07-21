import Vue from 'vue'
import Vuex from 'vuex'
import mutation from './mutations'
import state from './state'
import getters from './getters'
import createPersistedState from 'vuex-persistedstate'

// 1.安装插件
Vue.use(Vuex)

const store = new Vuex.Store({
    state,
    mutations: mutation,
    getters,
    modules: {},
    plugins: [createPersistedState()]
})

export default store
