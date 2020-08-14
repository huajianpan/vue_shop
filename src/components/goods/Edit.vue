<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-alert title="编辑商品信息 --1 页面路由刷新id无效 图片删除上传完善 动态参数 多选" type="info" show-icon center :closable="false"></el-alert>
      <!-- 步骤条区域 activeStep-0字符串转换成数字 -->
      <el-steps :active="activeStep-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- Tab栏区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeStep"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" >
              <el-input v-model="editForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" >
              <el-input v-model="editForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="editForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="goods_cat"
                :options="catelist"
                :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children',emitpath: false}"
                ref="cascaderRef"
                clearable
                disabled
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in editManyTableData"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_value" size="small">
                <el-checkbox
                  v-for="(attr_val,i) in item.attr_vals"
                  :label="attr_val"
                  border=""
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in editOnlyTableData"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_value"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action图片要上传的后台api地址 -->
            <el-upload
              class="upload-demo"
              drag
              :action="upLoadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
              :file-list="fileList"
              multiple
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或
                <em>点击上传</em>
              </div>
              <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="editForm.goods_introduce"></quill-editor>
            <el-button type="primary" style="margin-top:15px" @click="editGoods">编辑商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对对话框 -->
    <el-dialog title="图片预览" :visible.sync="picPreviewDialogVisible" width="80%">
      <img :src="previewPicUrl" width="100%" alt="预览图片">
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 步骤
      steps: ['基本信息', '商品参数', '商品属性', '商品图片', '商品内容'],
      // 当前所在的步骤
      activeStep: '',
      // 商品分类数据
      catelist: [],
      // 商品id
      goods_id: 0,
      // 基本信息步骤中的表单数据
      editForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 商品所属的分类数组[1级分类，2级分类，3级分类]
        // goods_cat: ['70', '75', '79'],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性` { attr_id: '', attr_value: '' }
        attrs: []
      },
      // 商品分类id
      goods_cat: [],
      // 商品分类对应的所有动态参数数据
      editManyTableData: [],
      // 商品分类对应的所有动态参数数据（仅包含 attr_id字段的对象组）
      editManyTableDataId: [],
      // 已分配的动态参数数据
      myManyTableData: [],
      // 商品分类对应的所有静态属性数据
      editOnlyTableData: [],
      // 商品分类对应的所有静态属性数据（仅包含 attr_id字段的对象组）
      editOnlyTableDataId: [],
      // 基本信息步骤中的表单数据验证规则
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      // 上传图片的URL地址
      upLoadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览框显示控制
      picPreviewDialogVisible: false,
      // 图片地址
      previewPicUrl: '',
      fileList: []
    }
  },
  methods: {
    // 获取分类数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类数据列表获取失败！')
      }
      // 分类数据，和总记录数
      this.catelist = res.data
      // console.log(this.catelist)
    },
    // 获取可选择的动态参数，静态属性的方法
    async getParamsData (sel) {
      // 证明选中的是三级分类
      // 根据所选的分类的id和当前的数据面板获取分类数据
      const { data: res } = await this.$http.get(
        'categories/' + this.goods_cat[2] + '/attributes',
        { params: { sel: sel } }
      )
      if (res.meta.status !== 200) {
        this.$message.error(
          '获取' + (sel === 'many' ? '动态参数' : '静态属性') + '列表失败！'
        )
      }
      // 如果是动态参数那么就分割字符
      if (sel === 'many') {
        res.data.forEach(item => {
        // 不作判断会导致无属性值的展开列出现空文本tag标签
          item.attr_vals =
          item.attr_vals.length !== 0 ? item.attr_vals.split(',') : []
        })
      }
      // 获取所有的商品分类下所有的 动态参数/静态属性 id
      const attrsId = []
      res.data.forEach(item => {
        const attrObj = { attr_id: item.attr_id }
        attrsId.push(attrObj)
      })

      // 将不同面板中的数据存入不同的变量中
      if (sel === 'many') {
        this.editManyTableDataId = attrsId
      } else {
        this.editOnlyTableDataId = attrsId
      }
    },
    // 处理文件图片预览效果
    handlePreview (file) {
      console.log(file)
      // 可选链接符
      this.previewPicUrl = file?.response?.data?.url || file.url
      this.picPreviewDialogVisible = true
    },
    // 处理文件图片移除操作事件
    handleRemove (file, fileList) {
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中，找到这个图片对应的索引值
      const i = this.editForm.pics.findIndex(x => x.pic === filePath)
      // 3.调用数组的splice方法，把图片信息对象从数组pics中移除
      this.editForm.pics.splice(i, 1)
      console.log(this.editForm)
    },
    // 文件上传成功时触发的回调函数
    handleSuccess (res) {
      // 1.拼接一个图片信息对象
      const picInfo = { pic: res.data.tmp_path }
      // 2.将图片信息对象拼接到数组中去
      this.editForm.pics.push(picInfo)
      console.log(this.editForm)
    },
    // 编辑商品
    editGoods () {
      // 1.编辑商品前先做表单校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请完善必要的表单项！')
        }
        // 2.验证通过 执行业务逻辑
        // 用lodash的方法将数据进行深拷贝，对商品分类数组进行转换，商品参数列表的处理
        const form = _.cloneDeep(this.editForm)

        // 处理动态参数
        this.editManyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(',')
          }
          this.editForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.editOnlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_value
          }
          this.editForm.attrs.push(newInfo)
        })
        form.attrs = this.editForm.attrs
        form.goods_cat = this.goods_cat.join(',')
        console.log(form)
        // 3.发起请求添加商品
        // 商品名称必须是唯一的
        const { data: res } = await this.$http.put('goods/' + this.goods_id, form)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('商品编辑失败！')
        }
        this.$message.success('商品编辑成功！')
        console.log(form)
        // this.$router.push('/goods')
      })
    },
    // 根据路由传来的商品ID获取商品信息存入editForm渲染表单
    async getGoodsInfo (goodsId) {
      const { data: res } = await this.$http.get('goods/' + goodsId)
      if (res.meta.status !== 200) {
        return this.$message.error('商品信息获取失败！')
      }
      // 对商品分类数据格式进行 字符转数组
      this.goods_cat = res.data.goods_cat.split(',')
      await this.getParamsData('many')
      await this.getParamsData('only')

      // 对图片数据格式进行修正
      res.data.pics.forEach(item => {
        const picObj = { name: '图片 ' + item.pics_id, url: item.pics_big_url }
        this.fileList.push(picObj)
      })
      // 对参数/属性 数据格式进行修正，选取需要的字段渲染数据
      const attrs = []
      res.data.attrs.forEach(item => {
        const attrObj = { attr_id: item.attr_id, attr_name: item.attr_name, attr_vals: item.attr_value }
        attrs.push(attrObj)
      })

      // 获取改商品的所有静态属性和动态参数 保存进数组
      const myAttrsId = []
      res.data.attrs.forEach(item => {
        const attrid = item.attr_id
        myAttrsId.push(attrid)
      })
      console.log(myAttrsId)
      // 获取所有静态属性id
      const onlyAttrsId = []
      this.editOnlyTableDataId.forEach(item => {
        const attrid = item.attr_id
        onlyAttrsId.push(attrid)
      })
      console.log(onlyAttrsId)
      // 去重找出动态属性的id组
      let len = myAttrsId.length
      const manyAttrsId = []
      while (len--) {
        if (onlyAttrsId.indexOf(myAttrsId[len]) < 0) {
          manyAttrsId.push(myAttrsId[len])
        }
      }
      console.log(manyAttrsId)
      // 根据id获取动态参数组
      const form = _.cloneDeep(res.data.attrs)
      console.log(form)
      this.editManyTableData = form.filter(item => {
        return manyAttrsId.includes(item.attr_id)
      })
      this.editManyTableData.forEach(item => {
        // 不作判断会导致无属性值的展开列出现空文本tag标签
        // 获取所有属性
        item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(',') : []
        // 包含的属性标签
        item.attr_value = item.attr_value.length !== 0 ? item.attr_value.split(',') : []
      })
      // 根据id获取静态属性组
      this.editOnlyTableData = form.filter(item => {
        return !manyAttrsId.includes(item.attr_id)
      })
      console.log(this.editManyTableData)
      console.log(this.editOnlyTableData)

      // this.goods_id = res.data.goods_id
      this.editForm.goods_name = res.data.goods_name
      this.editForm.goods_price = res.data.goods_price
      this.editForm.goods_weight = res.data.goods_weight
      this.editForm.goods_number = res.data.goods_number
      this.editForm.pics = res.data.pics
      this.editForm.goods_introduce = res.data.goods_introduce

      console.log(this.editForm)
    }
  },
  created () {
    this.getCateList()
    this.goods_id = this.$route.query
    // query && (this.editForm = query)
    this.getGoodsInfo(this.goods_id)
  },
  mounted () {

  }
}
</script>
<style lang="less" scoped>
.el-steps {
  margin: 20px 0;
}
.el-tabs {
  // margin: 20px 10px;
  height: fit-content;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
</style>
