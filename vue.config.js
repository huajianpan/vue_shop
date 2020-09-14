module.exports = {
  lintOnSave: false,
  // 为生产模式和开发模式打包指定不同入口文件
  chainWebpack: config => {
    // 生产模式的配置
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')

      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress', // 右边为node包exports的变量名，左边为包名
        'vue-quill-editor': 'VueQuillEditor'
      })
      // 为html文本添加自定义参数
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // 开发模式的配置
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  },
  devServer: {
    disableHostCheck: true
  }
}
