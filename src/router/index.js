import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import(/* webPackChunkName:"login-home-welcome */'../components/Login.vue')
const Home = () => import(/* webPackChunkName:"login-home-welcome */'../components/Home.vue')
const Welcome = () => import(/* webPackChunkName:"login-home-welcome */'../components/Welcome.vue')
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'

const Users = () => import(/* webPackChunkName:"Users-Roles-Rights */'../components/user/Users.vue')
const Roles = () => import(/* webPackChunkName:"Users-Roles-Rights */'../components/power/Roles.vue')
const Rights = () => import(/* webPackChunkName:"Users-Roles-Rights */'../components/power/Rights.vue')
// import Users from '../components/user/Users.vue'
// import Roles from '../components/power/Roles.vue'
// import Rights from '../components/power/Rights.vue'

const Cate = () => import(/* webPackChunkName:"CAPGE */'../components/goods/Cate.vue')
const AddGoods = () => import(/* webPackChunkName:"CAPGE */'../components/goods/Add.vue')
const Params = () => import(/* webPackChunkName:"CAPGE */'../components/goods/Params.vue')
const GoodsList = () => import(/* webPackChunkName:"CAPGE */'../components/goods/List.vue')
const EditGoods = () => import(/* webPackChunkName:"CAPGE */'../components/goods/Edit.vue')
// import Cate      from '../components/goods/Cate.vue'
// import AddGoods  from '../components/goods/Add.vue'
// import Params    from '../components/goods/Params.vue'
// import GoodsList from '../components/goods/List.vue'
// import EditGoods from '../components/goods/Edit.vue'

// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'
const Order = () => import(/* webPackChunkName:"Order */'../components/order/Order.vue')
const Report = () => import(/* webPackChunkName:"Report */'../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  }, {
    path: '/login',
    component: Login
  }, {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: AddGoods },
      { name: 'edit', path: '/goods/edit', component: EditGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作 next('/login')强制跳转login
router.beforeEach((to, from, next) => {
  // 访问登录页，放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token, 强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
