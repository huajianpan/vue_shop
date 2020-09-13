import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import TreeTable from 'vue-table-with-tree-grid'
// 全局导入富文本编辑器及其样式
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入 加载条对应js，css
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

import _ from 'lodash'

import axios from 'axios'

Vue.use(VueQuillEditor)

Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// request添加拦截器，显示加载条
axios.interceptors.request.use(config => {
  // 发送请求，显示加载条
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须 return config
  return config
})
// response添加拦截器，隐藏加载条
axios.interceptors.response.use(config => {
  // 收到服务响应，隐藏加载条
  Nprogress.done()
  // 最后必须 return config
  return config
})

Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false
Vue.filter('dateFormat', function (originVal) {
  const date = new Date(originVal)
  const Y = date.getFullYear()
  const M = (date.getMonth() + 1 + '').padStart(2, '0')
  const D = (date.getDate() + '').padStart(2, '0')
  const h = (date.getHours() + '').padStart(2, '0')
  const m = (date.getMinutes() + '').padStart(2, '0')
  const s = (date.getSeconds() + '').padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
