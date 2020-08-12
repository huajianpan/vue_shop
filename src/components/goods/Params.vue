<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类的区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="SelectedCateKeys"
            :options="catelist"
            :props="cateProp"
            @change="handleChange"
            ref="cascaderRef"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- mang only 为后端接口的参数值 -->
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            size="mini"
            @click="addParamsDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border="" stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  closable
                  :key="index"
                  @close="handleTagClose(scope.row,index)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            size="mini"
            @click="addParamsDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border="" stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  closable
                  :key="index"
                  @close="handleTagClose(scope.row,index)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 新增动态参数/静态属性对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addParamsDialogClosed"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsFormRules"
        ref="addParamsFormRef"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改动态参数/静态属性对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editParamsDialogClosed"
    >
      <el-form
        :model="editParamsForm"
        :rules="addParamsFormRules"
        ref="editParamsFormRef"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProp: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
        // checkStrictly: true
      },
      // 选择框选中的值
      SelectedCateKeys: [],
      // 当前页签页面名
      activeName: 'many',
      // 动态参数面板中的数据
      manyTableData: [],
      // 静态属性面板中的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addParamsDialogVisible: false,
      editParamsDialogVisible: false,
      // 添加/修改 参数属性的表单数据对象
      addParamsForm: {
        attr_name: ''
      },
      editParamsForm: {
        attr_name: '',
        attr_id: '',
        attr_vals: []
      },
      // 添加/修改 参数属性的表单数据对象的验证规则
      addParamsFormRules: {
        attr_name: { required: true, message: '请输入名称', trigger: 'blur' }
      }

    }
  },
  methods: {
    // 获取分类数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类数据列表获取失败！')
      }
      this.catelist = res.data
    },
    // 获取三级分类的详细参数列表
    async getParamsData () {
      // 以下条件限制了只能选择三级分类
      if (this.SelectedCateKeys.length !== 3) {
        this.SelectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 证明选中的是三级分类
      // console.log(this.SelectedCateKeys)
      // 根据所选的分类的id和当前的数据面板获取分类数据
      const { data: res } = await this.$http.get(
        'categories/' + this.cateId + '/attributes',
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        this.$message.error('获取参数列表失败！')
      }
      // console.log(res.data)
      res.data.forEach(item => {
        // 不作判断会导致无属性值的展开列出现空文本tag标签
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制展开列按钮与文本框的切换显示
        item.inputVisible = false
        // 绑定新增属性输入值
        item.inputValue = ''
      })
      // 将不同面板中的数据存入不同的变量中
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 级联选择框值变化触发该函数
    handleChange () {
      this.getParamsData()
    },
    // 页签切换触发函数
    handleTabClick () {
      this.getParamsData()
      // console.log(this.activeName)
    },
    // 显示添加参数，属性对话框，并获取数据
    showAddParamsDialog () {
      this.addParamsDialogVisible = true
    },
    // 添加参数/属性按钮事件
    addParams () {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        // console.log(this.addParamsForm)
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          { attr_name: this.addParamsForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('参数属性添加失败！')
        }
        this.$message.success('参数属性添加成功！')

        this.addParamsDialogVisible = false
        this.getParamsData()
      })
    },
    // 关闭对话框清除数据及验证
    addParamsDialogClosed () {
      this.$refs.addParamsFormRef.resetFields()
    },
    editParamsDialogClosed () {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 获取编辑对话框数据并显示
    async showEditDialog (rowInfo) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${rowInfo.attr_id}`,
        { params: { attr_sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('参数属性获取失败！')
      }
      this.editParamsForm = res.data
      this.editParamsDialogVisible = true
    },
    // 确定编辑按钮事件
    editParams () {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: this.editParamsForm.attr_vals
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('参数属性更新失败！')
        }
        console.log(res.data)
        this.$message.success('参数属性更新成功！')
        this.editParamsDialogVisible = false
        this.getParamsData()
      })
    },
    // 删除按钮事件
    async deleteParams (rowInfo) {
      const confirmResult = await this.$confirm(
        '是否确认删除该字段？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${rowInfo.attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('参数属性删除失败！')
      }
      this.$message.success('参数属性删除成功！')
      this.getParamsData()
    },
    // Tag标签删除属性值
    handleTagClose (rowInfo, i) {
      // 获取需要删除的标签的数组中位置并移除
      rowInfo.attr_vals.splice(i, 1)
      this.saveAttrVals(rowInfo)
    },
    // 切换Tag、Input显示状态
    showInput (rowInfo) {
      rowInfo.inputVisible = true
      this.$nextTick(_ => {
        // 输入框显示后获取焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 新增属性值Tag标签
    handleInputConfirm (rowInfo) {
      const inputValue = rowInfo.inputValue
      if (inputValue.trim().length !== 0) {
        // 新增标签
        rowInfo.attr_vals.push(inputValue.trim())
        this.saveAttrVals(rowInfo)
      }
      rowInfo.inputValue = ''
      rowInfo.inputVisible = false
    },
    // 新增删除参数项操作
    async saveAttrVals (rowInfo) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${rowInfo.attr_id}`,
        {
          attr_name: rowInfo.attr_name,
          attr_sel: rowInfo.attr_sel,
          attr_vals: rowInfo.attr_vals.toString()
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('参数属性组更新失败！')
      }
      this.$message.success('参数属性组更新成功！')
      // 只更新当前行，若更新整张表，重新渲染会闭合展开行
      // 注意：如果直接把变量引用名称赋值给role，role就不会再指向scope.row的对象，
      // 从而在也不会影响到原数据，所以只对其属性值操作 rowInfo = res.data  错
      // rowInfo.attr_vals = res.data.attr_vals ? res.data.attr_vals.split(',') : []  对
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 如果按钮需要被禁用，则返回true
    isBtnDisabled () {
      return this.SelectedCateKeys.length !== 3
    },
    // 当前选中的三级分类id
    cateId () {
      if (this.SelectedCateKeys.length === 3) return this.SelectedCateKeys[2]
      return null
    },
    // 动态计算标题的文本
    titleText () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px auto;
}
.el-tag {
  margin: 5px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 150px;
  margin-left: 10px;
  vertical-align: center;
}
.el-table{
  margin: 15px auto;
}
</style>
