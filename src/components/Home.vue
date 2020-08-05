<template>
  <el-container class="home-container">
    <!-- 页面头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.jpg" alt="logo">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isMenuToggle?'56px':'200px'">
        <div class="toggle-button" @click="toggleMenu">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="isMenuToggle"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
          :default-openeds="openedIndexArr"
          unique-opened
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id" :collapse='false'>
            <!-- 一级菜单的模板区 -->
            <template slot="title">
              <!-- 一级菜单的图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 一级菜单的模板 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" >
            <!-- <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)"> -->
              <!-- 二级菜单的模板区 -->
              <template slot="title">
                <!-- 二级菜单的图标、文本 -->
                <i class="el-icon-menu"></i>
                <!-- 二级菜单的文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 子路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      // 菜单图标
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 菜单是否折叠
      isMenuToggle: false,
      // 被激活的链接
      activePath: '',
      openedIndexArr: []
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.res)
      this.menulist = res.data
    },
    // 菜单折叠展开
    toggleMenu () {
      this.isMenuToggle = !this.isMenuToggle
    },
    // 保存菜单的链接激活状态
    saveNavState (activePath) {
      // window.sessionStorage.setItem('activePath', activePath)
      // 根据当前路由值高亮导航
      // this.activePath = activePath
    }
  },
  created () {
    this.getMenuList()
    // 刷新、首次加载时触发
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  watch: {
    // 用watch监听非DOM元素的改变,通过监听路由回退导致导航仍旧高亮的问题
    '$route.path': function (newVal) {
      // 闭合所有一级菜单
      if (newVal === '/welcome') this.openedIndexArr = []
      window.sessionStorage.setItem('activePath', newVal)
      this.activePath = newVal
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  //header内一级子元素左右贴边对齐
  display: flex;
  //横轴对齐方式
  justify-content: space-between;
  //纵轴对齐方式
  align-items: center;

  background-color: rgb(54, 61, 64);
  color: #fff;
  font-size: 20px;
  > div {
    height: 100%;
    display: flex;
    align-items: center;
    img {
      height: 100%;
    }
    span {
      font-size: 40px;
      margin-left: 20px;
    }
  }
}

.el-aside {
  background-color: rgb(49, 55, 67);
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: rgb(233, 237, 240);
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  //鼠标移入：小手提示
  cursor: pointer;
}
</style>
