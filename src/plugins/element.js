import Vue from 'vue'
import {
  Button, Form, FormItem,
  Input, Message, Container,
  Header, Aside, Main,
  Menu, MenuItem, Submenu,
  Breadcrumb, BreadcrumbItem, Card, Table, TableColumn, Row, Col,
  Switch, Tooltip, Pagination, Dialog, MessageBox, Tag, Tree, Option, Select
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.use(BreadcrumbItem)
Vue.use(Breadcrumb)
Vue.use(Card)
Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Row)
Vue.use(Col)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Option)
Vue.use(Select)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
