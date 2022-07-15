import Vue from 'vue'
export default new Vue


export const destroy = () => {

    this.$off('COMMAND_LOGIN_RESP')
}
