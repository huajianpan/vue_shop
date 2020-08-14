<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 树表格区域 -->
      <tree-table
        class="tree"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border=""
        :show-row-hover="true"
      >
        <!-- slot插槽名称 slot-scope插槽数据 -->
        <template slot="isok" slot-scope="scope">
          <i v-if="scope.row.cat_deleted===false" class="el-icon-success" style="color:lightgreen"></i>
          <i v-else class="el-icon-error" style="color:red"></i>
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <template slot="opera" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 6, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 新增分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="cascaderSelectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children',checkStrictly:true}"
            @change="parentCateChanged"
            ref="cascaderRef"
             clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 分类列表查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      catelist: [],
      // 数据总条数
      total: 0,
      // 为table指定列的定义 参考文档 https://github.com/MisterTaki/vue-table-with-tree-grid
      columns: [
        {
          label: '分类名称',
          // 取数据中对应的字段值
          prop: 'cat_name',
          width: '400px'
        },
        {
          label: '是否有效',
          minWidth: '50px',
          // 表示，将当前列定义为模板列
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板列
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opera'
        }
      ],
      cateinfo: {},
      // 新增与编辑分类的对话框显示控制
      addCateDialogVisible: false,
      editCateDialogVisible: false,
      // 编辑框的内容数据与校验规则
      editForm: {},
      editFormRules: {
        cat_name: { required: true, message: '请输入内容', trigger: 'blur' }
      },
      // 新增分类框的内容数据对象与校验规则
      addForm: {
        // 添加的分类名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类的等级，默认是一级分类
        cat_level: 0
      },
      addFormRules: {
        cat_name: { required: true, message: '请输入分类名称', trigger: 'blur' }
      },
      // 父级分类的列表
      parentCateList: [],
      // 新增分类中选中的父级分类的值,级联选择为多选所以为数组
      cascaderSelectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 监听pagesize变化的事件
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 获取分类数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类数据列表获取失败！')
      }
      // 分类数据，和总记录数
      this.total = res.data.total
      this.catelist = res.data.result
    },
    // 删除分类
    async deleteCate (cateinfo) {
      console.log(cateinfo)

      const result = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result === 'cancel') {
        return this.$message.error('取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + cateinfo.cat_id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      cateinfo = res.data
      this.$message.success('删除分类成功！')
      this.getCateList()
      // this.getCateList()
      // console.log(this.queryInfo)
    },
    // 获取编辑的数据并展示对话框
    showEditCateDialog (cateinfo) {
      this.editForm = cateinfo
      this.editCateDialogVisible = true
    },
    showAddCateDialog () {
      this.getParentCtaList()
      this.addCateDialogVisible = true
    },
    // 监听确定按钮编辑事件
    editCate () {
      // showEditCateDialog函数已经将需要编辑的分类信息存储在data数据editForm中
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          { cat_name: this.editForm.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑分类失败！')
        }
        this.$message.success('编辑分类成功！')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    // 新增与编辑分类对话框关闭时表单重置
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
      this.cascaderSelectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    editDialogClosed () {
      this.editForm = {}
      this.$refs.editFormRef.resetFields()
    },
    // 获取父级分类数据列表
    async getParentCtaList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败！')
      }
      this.parentCateList = res.data
    },
    // 新增分类选择项发生变化触发该函数
    parentCateChanged () {
      // 如果cascaderSelectedKeys数组中的length大于0，则说明选中了父级分类
      // 反之就说明没有选中任何父级分类
      const length = this.cascaderSelectedKeys.length
      this.addForm.cat_pid = length > 0 ? this.cascaderSelectedKeys[length - 1] : 0
      this.addForm.cat_level = length
    },
    // 点击按钮，新增分类
    addCate () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories/', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    }
  },
  watch: {
    // 新增框中级联选择器选中后关闭下拉框
    cascaderSelectedKeys () {
      if (this.$refs.cascaderRef) {
        // console.log(this.$refs.cascaderRef)
        this.$refs.cascaderRef.dropDownVisible = false
      }
    },
    total () {
      if ((this.total === (this.queryInfo.pagenum - 1) * this.queryInfo.pagesize) && (this.total !== 0)) {
        this.queryInfo.pagenum -= 1
        this.getCateList()// 获取列表数据
      }
    }

  }
}
</script>
<style lang="less" scoped>
.tree {
  margin: 15px auto;
}
.el-cascader{
  width: 100% !important;
}

</style>
