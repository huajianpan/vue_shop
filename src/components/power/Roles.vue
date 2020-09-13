<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row :gutter="40">
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border="" stripe style="width: 100%" row-key="id">
        <!-- 展开列 -->
        <el-table-column type="expand" width="60px" align="center">
          <template slot-scope="scope">
            <!-- <pre>{{scope.row}}</pre> -->
            <el-row
              :gutter="40"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',i1?'':'bdtop']"
              justify="center"
              align="middle"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="6">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="18">
                <!-- 通过for循环 嵌套渲染染二级权限 -->
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="[i2===0?'':'bdtop']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过for循环 嵌套渲染染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#" width="60px" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              @click="removeRoleById(scope.row)"
              icon="el-icon-delete"
              size="mini"
            >删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="defKeys=[]">
      <!-- 树形控件 -->
      <!-- node-key：选中了具体的节点就相当于选中了具体的id 即node-key制定的属性 -->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色弹出框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="addFormRules"
        ref="editFormRef"
        label-width="80px"

      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRule">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色弹出框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"

      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRule">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 所有权限数据
      rightsList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 定义树的子属性，标签
      treeProps: {
        // 树控件显示的文本
        label: 'authName',
        // 子层级属性
        children: 'children'
      },
      // 默认选中树节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 添加角色弹窗显示标识
      addDialogVisible: false,
      // 添加角色弹窗数据
      addForm: {},
      // 添加角色弹窗输入规则
      addFormRules: {
        // 验证用户名
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 修改角色弹窗显示标识
      editDialogVisible: false,
      // 修改角色弹窗的数据
      editForm: {}

    }
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    // 移除角色权限
    async removeRightById (role, rightId) {
      // 如果用户确认删除 则confirmResult 为返回字符串confirm
      // 如果用户取消了删除 则confirmResult 为返回字符串cancel
      const confirmResult = await this.$confirm(
        '此操作删除角色权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')

      // 重新获取角色列表，获取后会重新渲染整张表的数据，将展开的内容闭合，所以不采用
      // this.getRolesList()

      // 只重新渲染当前行，不会闭合,防止整个列表刷新
      // 注意：如果直接把变量引用名称赋值给role，role就不会再指向scope.row的对象，从而在也不会影响到原数据，所以只对其属性值操作
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 保存当前角色Id
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.rightsList = res.data
      // console.log(this.rightsList)

      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归方式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 若node不包含children属性则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 点击确定为角色分配权限
    async allotRights (roleId) {
      // 获取选中与半选中的节点id
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('角色权限修改失败！')
      }
      this.$message.success('角色权限修改成功！')
      // 刷新角色权限列表数据，更新展开内容
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 通过角色id删除角色
    async removeRoleById (roleinfo) {
      // 如果用户确认删除 则confirmResult 为返回字符串confirm
      // 如果用户取消了删除 则confirmResult 为返回字符串cancel
      const confirmResult = await this.$confirm(
        '此操作将永久该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + roleinfo.id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      this.getRolesList()
    },
    // 添加角色确定按钮事件
    async addRule () {
      const { data: res } = await this.$http.post('roles', this.addForm)
      if (res.meta.status !== 201) {
        return this.$message.error('角色创建失败！')
      }
      this.$message.success('角色创建成功！')
      this.addDialogVisible = false
      this.getRolesList()
    },
    // 监听添加角色弹框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 重置数据,清除历史验证结果
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 展示编辑用户的对话框
    async showEditDialog (roleinfo) {
      const { data: res } = await this.$http.get('roles/' + roleinfo.id)
      // 与分配权限中的roleid共用，每次打开弹框都会覆盖之前的值所以不会互相影响
      this.roleId = roleinfo.id
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑角色
    async editRule () {
      const { data: res } = await this.$http.put('roles/' + this.roleId, this.editForm)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('角色编辑失败！')
      }
      this.$message.success('角色编辑成功！')
      this.editDialogVisible = false
      this.getRolesList()
    }
  },
  created () {
    this.getRolesList()
  }
}
</script>
<style lang="less" scoped>
.el-button {
  margin-bottom: 15px;
}
.el-icon-close {
  margin-left: 5px;
}
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>
