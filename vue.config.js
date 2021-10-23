const { mergeSassVariables } = require('@vuetify/cli-plugin-utils')
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: "http://localhost",
        changeOrigin: false,
        pathRewrite: {
          '^/api': ""
        }
      }
    }
  },
  transpileDependencies: [
    'vuetify'
  ],
  chainWebpack: config => {
    const modules = ['vue-modules', 'vue', 'normal-modules', 'normal']
    modules.forEach(match => {
      config.module
          .rule('sass')
          .oneOf(match)
          .use('sass-loader')
          .tap(opt => mergeSassVariables(opt, "'@/styles/variables.scss'"))
      config.module
          .rule('scss')
          .oneOf(match)
          .use('sass-loader')
          .tap(opt => mergeSassVariables(opt, "'@/styles/variables.scss';"))
    })
  },
}
