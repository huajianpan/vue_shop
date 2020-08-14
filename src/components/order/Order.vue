<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 栅格布局 -->
      <el-row :gutter="40">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="getOrdersList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList">1</el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" border="" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="50px"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100px"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="80px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="90px"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="160px">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="140px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="editDialogVisible=true"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button type="success" @click="showProgress" icon="el-icon-location" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 数据分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 15, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background=""
      ></el-pagination>
    </el-card>
    <!-- 修改地址弹出框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="90px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="county">
          <el-cascader
            v-model="editForm.county"
            :options="cityData"
            :props="{ expandTrigger: 'hover',value:'value',label:'label',children:'children'}"
            ref="cascaderRef"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="consignee_addr">
          <el-input v-model="editForm.consignee_addr"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度展示弹出框 -->
    <el-dialog title="物流信息" :visible.sync="progressDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <!-- 时间线组件 -->
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      cityData: cityData,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      ordersList: [],
      total: 0,
      editDialogVisible: false,
      editForm: {
        county: [],
        consignee_addr: ''
      },
      editFormRules: {
        county: [{ required: true, message: '请选择区域', trigger: 'change' }],
        consignee_addr: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  methods: {
    // 监听pagesize变化的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    // 获取分页对应的订单列表
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据列表失败！')
      }
      this.total = res.data.total
      this.ordersList = res.data.goods
    },
    editDialogClosed () {
      console.log(_.cloneDeep(this.editForm))
      this.$refs.editFormRef.resetFields()
    },
    async showProgress () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.$message.success('获取物流信息成功')
      this.progressInfo = res.data
      this.progressDialogVisible = true
      console.log(this.progressInfo)
    }
  },
  created () {
    this.getOrdersList()
  }
}
</script>
<style lang="less" scoped>
.el-table {
  margin: 15px auto;
}
.el-cascader {
  width: 100%;
}
</style>
