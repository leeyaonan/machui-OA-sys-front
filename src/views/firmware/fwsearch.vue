<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.oemId" clearable class="filter-search" style="width: 25%;" placeholder="请输入oemId">
        <template slot="prepend">oemId</template>
      </el-input>
      <el-input v-model="listQuery.hwId" clearable class="filter-search" style="width: 25%;" placeholder="请输入hwId">
        <template slot="prepend">hwId</template>
      </el-input>
      <el-input v-model="listQuery.micType" clearable class="filter-search" style="width: 25%;" placeholder="请输入mic类别">
        <template slot="prepend">mic</template>
      </el-input>
      <!-- 如果需要权限才显示使用v-permission -->
      <el-button v-permission="['GET /admin/ad/list']" class="" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row row-key="id">

      <el-table-column align="center" label="固件版本id" prop="fwId" sortable min-width="40"/>

      <el-table-column align="center" label="产品版本号" prop="fwVerNum" sortable/>

      <el-table-column align="center" label="固件版本号" prop="pdVerNum" sortable/>

      <el-table-column align="center" label="oemId" prop="oemId" sortable/>

      <el-table-column align="center" label="hwId" prop="hwId" sortable/>

      <el-table-column align="center" label="mic大类" prop="micType" sortable/>

      <el-table-column align="center" label="物模型定义" prop="model" sortable/>

      <el-table-column align="center" label="状态" prop="status" sortable>
        <template slot-scope="scope">
          {{ statusMap[scope.row.status] }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="描述" prop="description" sortable/>

      <el-table-column align="center" label="录入时间" prop="ctime" sortable/>

      <el-table-column align="center" label="更改时间" prop="mtime" sortable/>

      <!-- <el-table-column align="center" min-width="100" label="简介" prop="desc"/> -->
      <!--       <el-table-column align="center" label="级别" prop="level">
              <template slot-scope="scope">
                <el-tag :type="scope.row.level === 'L1' ? 'primary' : 'info' ">{{ scope.row.level === 'L1' ? '一级类目' : '二级类目' }}</el-tag>
              </template>
            </el-table-column> -->

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/category/update']" type="primary" size="small" @click="handleLook(scope.row)">查看详情</el-button>
          <el-button v-permission="['POST /admin/category/delete']" v-if="scope.row.status == 0" type="danger" size="small" @click="handleMark(scope.row)">标记已验证</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 查看对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="固件版本id" prop="fwId">
          <el-input v-model="dataForm.fwId" disabled/>
        </el-form-item>
        <el-form-item label="产品版本号" prop="fwVerNum">
          <el-input v-model="dataForm.fwVerNum" disabled/>
        </el-form-item>
        <el-form-item label="固件版本号" prop="pdVerNum">
          <el-input v-model="dataForm.pdVerNum" disabled/>
        </el-form-item>
        <el-form-item label="oemId" prop="oemId">
          <el-input v-model="dataForm.oemId" disabled/>
        </el-form-item>
        <el-form-item label="hwId" prop="hwId">
          <el-input v-model="dataForm.hwId" disabled/>
        </el-form-item>
        <el-form-item label="mic大类" prop="micType">
          <el-input v-model="dataForm.micType" disabled/>
        </el-form-item>
        <el-form-item label="物模型定义" prop="model">
          <el-input v-model="dataForm.model" disabled/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-input v-model="dataForm.status" disabled/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dataForm.description" disabled/>
        </el-form-item>
        <el-form-item label="录入时间" prop="ctime">
          <el-input v-model="dataForm.ctime" disabled/>
        </el-form-item>
        <el-form-item label="更改时间" prop="mtime">
          <el-input v-model="dataForm.mtime" disabled/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible = false">确定</el-button>
      </div>
    </el-dialog>

    <!-- 标记对话框 -->
    <el-dialog :visible.sync="dialogMarkVisible" title="标记合格对话框">
      <span>确认标记合格？</span>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogMarkVisible = false">取消</el-button>
        <el-button type="danger" @click="updateStatus">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<style scoped>
.filter-search{
  margin-right: 3%;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>

<script>
import { listFirmware, markStatus } from '@/api/fwsearch'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  name: 'Fwsearch',
  components: { Pagination },
  data() {
    return {
      uploadPath,
      list: [],
      total: 0, // 总页数
      listLoading: false, // 测试把loading关了
      listQuery: {
        page: 1,
        limit: 20,
        oemId: undefined,
        hwId: undefined,
        micType: undefined,
        order: 'asc'
      },
      catL1: {},
      dataForm: {
        fwId: '',
        fwVerNum: '',
        pdVerNum: '',
        oemId: '',
        hwId: '',
        micType: '',
        model: '',
        status: '',
        description: '',
        ctime: '',
        mtime: ''
      },
      dialogFormVisible: false,
      dialogMarkVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      statusMap: ['测试状态', '验证状态', '发布状态'], // 传过来是0 1 2显示是文字
      rules: {
        name: [{ required: true, message: '类目名不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    headers() {
      return {
        'X-cskaoyanmall-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
    // this.getCatL1()
  },
  methods: {
    getList() {
      this.listLoading = true
      listFirmware(this.listQuery)
        .then(response => {
          this.list = response.data.data
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.listLoading = false
        })
    },
    resetForm() {
      this.dataForm = {
        fwId: '',
        fwVerNum: '',
        pdVerNum: '',
        oemId: '',
        hwId: '',
        micType: '',
        model: '',
        status: '',
        description: '',
        ctime: '',
        mtime: ''
      }
    },
    onLevelChange: function(value) {
      if (value === 'L1') {
        this.dataForm.pid = 0
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    uploadIconUrl: function(response) {
      this.dataForm.iconUrl = response.data.url
    },
    uploadPicUrl: function(response) {
      this.dataForm.picUrl = response.data.url
    },
    handleLook(row) {
      this.dataForm = Object.assign({}, row)
      this.dataForm.status = this.statusMap[this.dataForm.status] // 转成文字显示
      this.dialogStatus = 'look'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleMark(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogMarkVisible = true
    },
    updateStatus() {
      markStatus(this.dataForm)
        .then(() => {
          this.getList()
          this.dialogMarkVisible = false
          this.$notify.success({
            title: '成功',
            message: '标记成功'
          })
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    }
  }
}
</script>
