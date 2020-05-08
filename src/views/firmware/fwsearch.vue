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
      <el-button v-permission="['GET /admin/ad/list']" class="filter-button" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>

      <div class="">
        <span class="filter-label">状态选择</span>
        <el-select v-model="listQuery.status" multiple placeholder="请选择" style="width: 25%;" >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </div>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row row-key="id">

      <el-table-column align="center" label="固件版本id" prop="fwId" sortable min-width="40"/>

      <el-table-column align="center" label="产品版本号" prop="pdVerNum" sortable/>

      <el-table-column align="center" label="固件版本" prop="fwVer" sortable/>

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
          <el-button v-permission="['POST /admin/category/delete']" v-if="scope.row.status == 0" type="danger" size="small" @click="handleTest(scope.row)">标记提测</el-button>
          <el-button v-permission="['POST /admin/category/delete']" v-if="scope.row.status == 0" type="danger" size="small" @click="handleModel(scope.row)">修改物模型</el-button>
          <el-button v-permission="['POST /admin/category/delete']" v-if="scope.row.status == 1" type="danger" size="small" @click="handleMark(scope.row)">标记验证状态</el-button>
          <el-button v-permission="['POST /admin/category/update']" v-if="scope.row.status != 3 || scope.row.status != 4 || scope.row.status != 5" type="danger" size="small" @click="handleAbort(scope.row)">标记废除状态</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 查看对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="1000px">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 100%; ">
        <!--<el-form-item label="固件版本id" prop="fwId">-->
        <!--  <el-input v-model="dataForm.fwId" disabled/>-->
        <!--</el-form-item>-->
        <el-form-item label="产品版本号" prop="fwVer">
          <el-input v-model="dataForm.fwVer" disabled style="width: 200px;"/>
        </el-form-item>
        <el-form-item label="固件版本号" prop="pdVerNum">
          <el-input v-model="dataForm.pdVerNum" disabled style="width: 200px;"/>
        </el-form-item>
        <el-form-item label="oemId" prop="oemId">
          <el-input v-model="dataForm.oemId" disabled/>
        </el-form-item>
        <el-form-item label="hwId" prop="hwId">
          <el-input v-model="dataForm.hwId" disabled/>
        </el-form-item>
        <el-form-item label="mic类别" prop="micType">
          <el-input v-model="dataForm.micType" disabled style="width: 200px;"/>
        </el-form-item>
        <el-form-item label="物模型定义" prop="model">
          <el-input v-model="dataForm.model" disabled style="max-height: 50px;"/>
        </el-form-item>
        <h3>最近日志：</h3>
        <el-table v-loading="listLoading" :data="detailList" element-loading-text="正在查询中。。。" border fit highlight-current-row row-key="id">
          <el-table-column align="center" label="操作员" prop="opsUserId" sortable/>
          <el-table-column align="center" label="操作类型" prop="opType" sortable/>
          <el-table-column align="center" label="操作内容" prop="opDesc" sortable/>
          <el-table-column align="center" label="修改后/同步的物模型信息" prop="model" sortable/>
          <el-table-column align="center" label="操作时间" prop="mtime" sortable/>
          <el-table-column align="center" label="操作状态" prop="opStatus" sortable/>
          <el-table-column align="center" label="ip" prop="ip" sortable/>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible = false">返回</el-button>
      </div>
    </el-dialog>

    <!-- 标记对话框 -->
    <el-dialog :visible.sync="dialogMarkVisible" title="标记对话框">
      <span>确认标记合格？</span>
      <div>
        <el-radio v-model="listUpdate.status" label="3">标记已验证</el-radio>
      </div>

      <div>
        <el-radio v-model="listUpdate.status" label="2">标记验证失败</el-radio>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogMarkVisible = false">取消</el-button>
        <el-button type="danger" @click="updateStatus">确定</el-button>
      </div>
    </el-dialog>

    <!-- 标记二次确认对话框 -->
    <el-dialog :visible.sync="dialogMarkVisible2" title="标记对话框">
      <div>
        <div v-if="listUpdate.status=='3'">
          <span>该操作不可逆，确定标记固件版本已验证？</span>
        </div>

        <div v-else>
          <span>该操作不可逆，确定标记固件版本验证失败？</span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogMarkVisible2 = false">取消</el-button>
        <el-button type="danger" @click="updateStatus2">确定</el-button>
      </div>
    </el-dialog>

    <!-- 废除确认对话框 -->
    <el-dialog :visible.sync="dialogAbortVisible" title="确认标记废除">
      <div>
        <span>该操作不可逆，确定标记固件版本已验证？</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogAbortVisible = false">取消</el-button>
        <el-button type="danger" @click="updateStatus5">确定</el-button>
      </div>
    </el-dialog>

    <!--显示固件版本模态框-->
    <el-dialog :visible.sync="dialogTestVisible" title="标记提测">
      <span>标记固件版本进入提测状态，物模型定义不可再更改！请确认！</span>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogTestVisible = false">取消</el-button>
        <el-button type="danger" @click="updateStatus3">确定</el-button>
      </div>
    </el-dialog>

    <!--修改物模型模态框-->
    <el-dialog :visible.sync="dialogModelVisible" title="修改物模型">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="固件版本id" prop="fwId">
          <el-input v-model="dataForm.fwId" disabled/>
        </el-form-item>
        <el-form-item label="修改物模型" prop="model">
          <el-upload
            :show-file-list="true"
            :on-success="uploadModelUrl"
            :limit="1"
            :action="uploadPath"
            :auto-upload="true"
            :data="dataForm"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"> <!--是否和老师一样-->
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogModelVisible = false">取消</el-button>
        <el-button type="danger" @click="updateStatus4">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.filter-search{
  margin-right: 3%;
  margin-bottom: 15px;
}
.filter-label {
  display:inline-block;
  width:80px;
  height:35px;
  line-height:35px;
  border:1px solid #DCDFE6;
  border-radius:4px;
  vertical-align:top;
  text-align:center;
  color:#909399;
  background:#f5f7fa;
  font-size:14px;
  margin-right:-6px;
}
.filter-button {
  margin-left: 20px;
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
import { listFirmware, listDetailFirmware, markStatus, updateFirmware } from '@/api/fwsearch'
import { uploadPath } from '@/api/storage'
import { getToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  name: 'Fwsearch',
  components: { Pagination },
  data() {
    return {
      uploadPath,
      list: [], // 显示信息
      detailList: [], // 显示具体单条信息
      total: 0, // 总页数
      listLoading: false, // 测试把loading关了
      listQuery: {
        page: 1,
        limit: 20,
        oemId: undefined,
        hwId: undefined,
        micType: undefined,
        status: [],
        order: 'asc'
      },
      listDetailQuery: {
        page: 1,
        limit: 20,
        // oemId: undefined,
        // hwId: undefined,
        // micType: undefined,
        // status: [],
        fwId: undefined,
        order: 'asc'
      },
      listUpdate: { // 测试人员：标记验证情况参数
        status: undefined,
        fwId: undefined
      },
      testMarkQuery: { // 测试人员： 标记提测参数
        status: undefined,
        fwId: undefined
      },
      listAbort: { // 测试人员：标记验证情况参数
        status: undefined,
        fwId: undefined
      },
      catL1: {},
      dataForm: {
        fwId: '',
        fwVer: '',
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
      dialogFormVisible: false, // 显示详情
      dialogMarkVisible: false, // 显示标记
      dialogMarkVisible2: false, // 显示标记2
      dialogAbortVisible: false, // 显示标记废除对话框
      dialogTestVisible: false, // 显示评测
      dialogModelVisible: false, // 显示物模型
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      statusMap: ['待测试', '提测中', '已验证', '验证失败', '已发布', '已废除'], // 传过来是0 1 2显示是文字
      rules: {
        name: [{ required: true, message: '类目名不能为空', trigger: 'blur' }]
      },
      options: [{
        value: '0',
        label: '待测试'
      }, {
        value: '1',
        label: '提测中'
      }, {
        value: '2',
        label: '已验证'
      }, {
        value: '3',
        label: '验证失败'
      }, {
        value: '4',
        label: '已发布'
      }, {
        value: '5',
        label: '已废除'
      }]
    }
  },
  computed: {
    headers() {
      return {
        'Tims-Admin-Token': getToken()
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
    getDetailList(raw) {
      this.listLoading = true
      this.listDetailQuery.fwId = raw.fwId
      listDetailFirmware(this.listDetailQuery)
        .then(response => {
          this.detailList = response.data.data
          this.listLoading = false
        })
        .catch(() => {
          this.detailList = []
          this.listLoading = false
        })
    },
    resetForm() {
      this.dataForm = {
        fwId: '',
        fwVer: '',
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
      this.getDetailList(row)
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
      this.listUpdate.fwId = row.fwId
      this.dialogMarkVisible = true
    },
    handleTest(row) {
      this.testMarkQuery.fwId = row.fwId
      this.testMarkQuery.status = row.status + 1 // 待测试进入提测中
      this.dialogTestVisible = true
    },
    handleModel(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogModelVisible = true
    },
    handleAbort(row) {
      this.dataForm = Object.assign({}, row)
      this.listAbort.fwId = row.fwId
      this.listAbort.status = 5
      this.dialogAbortVisible = true
    },
    updateStatus() {
      this.dialogMarkVisible2 = true
    },
    updateStatus2() {
      markStatus(this.listUpdate)
        .then(() => {
          this.getList()
          this.dialogMarkVisible = false
          this.dialogMarkVisible2 = false
          if (this.listUpdate.status === '3') {
            this.$notify.success({
              title: '成功',
              message: '标记成功'
            })
          } else {
            this.$notify.success({
              title: '成功',
              message: '标记验证失败'
            })
          }
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    updateStatus3() {
      markStatus(this.testMarkQuery)
        .then(() => {
          this.getList()
          this.dialogTestVisible = false
          this.$notify.success({
            title: '成功',
            message: '标记测试成功'
          })
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    updateStatus5() {
      markStatus(this.listAbort)
        .then(() => {
          this.getList()
          this.dialogAbortVisible = false
          this.$notify.success({
            title: '成功',
            message: '标记测试成功'
          })
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    uploadModelUrl(response) {
      // this.dataForm.model = response.data.model
    },
    updateStatus4() {
      this.dialogModelVisible = false
      updateFirmware(this.dataForm)
        .then(() => {
          this.getList()
          this.dialogModelVisible = false
          this.$notify.success({
            title: '成功',
            message: '更新成功'
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
