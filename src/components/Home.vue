<template>
  <div class="home_container">
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>
<script>
export default {
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  },
  mounted () {
    console.log(this)
  }
}
</script>
<style lang="less" scoped>
.el-button--info{
  width: 200px;
  height: 200px;
}
</style>
