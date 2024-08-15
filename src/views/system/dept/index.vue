<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item prop="deptName">
                <el-input
                        v-model="queryParams.deptName"
                        placeholder="请输入区域名称"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="区域状态" clearable style="width: 200px">
                    <el-option
                            v-for="dict in sys_normal_disable"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>

                <el-button
                        type="info"
                        plain
                        icon="Upload"
                        @click="handleImport"
                        v-hasPermi="['system:dept:import']"
                >导入
                </el-button>

            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                        type="primary"
                        plain
                        icon="Plus"
                        @click="handleAdd"
                        v-hasPermi="['system:dept:add']"
                >新增
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="info"
                        plain
                        icon="Sort"
                        @click="toggleExpandAll"
                >展开/折叠
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table
                v-if="refreshTable"
                v-loading="loading"
                :data="deptList"
                row-key="deptId"
                :default-expand-all="isExpandAll"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
            <el-table-column prop="deptName" label="区域名称" width="260"></el-table-column>
            <el-table-column prop="orderNum" label="排序" width="200"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                    <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
                </template>
            </el-table-column>

            <el-table-column label="区域属性" align="center" key="areaType" prop="areaType" width="200">
                <template #default="scope">
                    <span v-if="scope.row.areaType=== '1'">农村</span>
                    <span v-else-if="scope.row.areaType=== '2'">城市</span>
                </template>
            </el-table-column>
            <el-table-column prop="thirdCode" label="外部编号" width="200"></el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" width="200">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['system:dept:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)"
                               v-hasPermi="['system:dept:add']">新增
                    </el-button>
                    <el-button v-if="scope.row.parentId != 0" link type="primary" icon="Delete"
                               @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加或修改区域对话框 -->
        <el-dialog :title="title" v-model="open" width="600px" append-to-body>
            <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="上级区域" prop="parentId">
                    <el-tree-select
                            v-model="form.parentId"
                            :data="deptOptions"
                            :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                            value-key="deptId"
                            placeholder="选择上级区域"
                            check-strictly
                    />
                </el-form-item>
                <el-form-item label="区域属性" prop="areaType">
                    <el-select v-model="form.areaType" placeholder="请选择区域属性">
                        <el-option label="农村" value="1"></el-option>
                        <el-option label="城市" value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="区域名称" prop="deptName">
                    <el-col :span="15">
                        <el-input v-model="form.deptName" placeholder="请输入区域名称"/>
                    </el-col>
                </el-form-item>
                <el-form-item label="外部编号" prop="thirdCode">
                    <el-col :span="15">
                        <el-input v-model="form.thirdCode" placeholder="请输入外部编号"/>
                    </el-col>
                </el-form-item>
                <el-form-item label="负责人" prop="leader">
                    <el-col :span="15">
                        <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20"/>
                    </el-col>
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-col :span="15">
                        <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11"/>
                    </el-col>
                </el-form-item>
                <el-form-item label="显示排序" prop="orderNum">
                    <el-input-number v-model="form.orderNum" controls-position="right"/>
                </el-form-item>
                <el-form-item label="区域状态">
                    <el-radio-group v-model="form.status">
                        <el-radio
                                v-for="dict in sys_normal_disable"
                                :key="dict.value"
                                :label="dict.value"
                        >{{ dict.label }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>


        <!-- 导入对话框 -->
        <el-dialog
                :title="upload.title"
                v-model="upload.open"
                width="400px"
                append-to-body
        >
            <el-upload
                    ref="uploadRef"
                    :limit="1"
                    accept=".xlsx, .xls"
                    :headers="upload.headers"
                    :action="upload.url + '?updateSupport=' + upload.updateSupport"
                    :disabled="upload.isUploading"
                    :on-progress="handleFileUploadProgress"
                    :on-success="handleFileSuccess"
                    :auto-upload="false"
                    :show-file-list="true"
                    v-loading.fullscreen.lock="upload.loading"
                    element-loading-text="正在上传中，请稍后..."
                    element-loading-background="rgba(0,0,0,0.7)"
                    drag
            >
                <el-icon class="el-icon--upload">
                    <upload-filled/>
                </el-icon>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <template #tip>
                    <div class="el-upload__tip text-center">
                        <span>仅允许导入xls、xlsx格式文件。</span>
                        <el-link
                                type="primary"
                                :underline="false"
                                style="font-size: 12px; vertical-align: baseline"
                                @click="importTemplate"
                        >下载模板
                        </el-link>
                    </div>
                </template>

            </el-upload>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitFileForm">确 定</el-button>
                    <el-button @click="upload.open = false">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Dept">
    import {getToken} from '@/utils/auth';
    import {addDept, delDept, getDept, listDept, listDeptExcludeChild, updateDept} from "@/api/system/dept";

    const {proxy} = getCurrentInstance();
    const {sys_normal_disable} = proxy.useDict("sys_normal_disable");

    const deptList = ref([]);
    const open = ref(false);
    const loading = ref(true);
    const showSearch = ref(true);
    const title = ref("");
    const deptOptions = ref([]);
    const isExpandAll = ref(false);
    const refreshTable = ref(true);

    /*** 导入参数 */
    const upload = reactive({
        // 是否显示弹出层（导入）
        open: false,
        loading: false,
        // 弹出层标题（导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {Authorization: 'Bearer ' + getToken()},
        // 上传的地址
        url: import.meta.env.VITE_APP_BASE_API + '/system/dept/importData',
    });

    const data = reactive({
        form: {},
        queryParams: {
            deptName: undefined,
            status: undefined
        },
        rules: {
            parentId: [{required: true, message: "上级区域不能为空", trigger: "blur"}],
            deptName: [{required: true, message: "区域名称不能为空", trigger: "blur"}],
            email: [{type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"]}],
            phone: [{pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur"}]
        },
    });

    const {queryParams, form, rules} = toRefs(data);

    /** 查询区域列表 */
    function getList() {
        loading.value = true;
        listDept(queryParams.value).then(response => {
            deptList.value = proxy.handleTree(response.data, "deptId");
            loading.value = false;
        });
    }

    /** 取消按钮 */
    function cancel() {
        open.value = false;
        reset();
    }

    /** 表单重置 */
    function reset() {
        form.value = {
            deptId: undefined,
            parentId: undefined,
            deptName: undefined,
            orderNum: undefined,
            leader: undefined,
            phone: undefined,
            email: undefined,
            status: "0"
        };
        proxy.resetForm("deptRef");
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        getList();
    }

    /** 重置按钮操作 */
    function resetQuery() {
        proxy.resetForm("queryRef");
        handleQuery();
    }

    /** 新增按钮操作 */
    function handleAdd(row) {
        reset();
        listDept().then(response => {
            deptOptions.value = proxy.handleTree(response.data, "deptId");
        });
        if (row != undefined) {
            form.value.parentId = row.deptId;
        }
        open.value = true;
        title.value = "添加区域";
    }

    /** 展开/折叠操作 */
    function toggleExpandAll() {
        refreshTable.value = false;
        isExpandAll.value = !isExpandAll.value;
        nextTick(() => {
            refreshTable.value = true;
        });
    }

    /** 修改按钮操作 */
    function handleUpdate(row) {
        reset();
        listDeptExcludeChild(row.deptId).then(response => {
            deptOptions.value = proxy.handleTree(response.data, "deptId");
        });
        getDept(row.deptId).then(response => {
            form.value = response.data;
            open.value = true;
            title.value = "修改区域";
        });
    }

    /** 提交按钮 */
    function submitForm() {
        proxy.$refs["deptRef"].validate(valid => {
            if (valid) {
                if (form.value.deptId != undefined) {
                    updateDept(form.value).then(response => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    });
                } else {
                    addDept(form.value).then(response => {
                        proxy.$modal.msgSuccess("新增成功");
                        open.value = false;
                        getList();
                    });
                }
            }
        });
    }

    /** 删除按钮操作 */
    function handleDelete(row) {
        proxy.$modal.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?').then(function () {
            return delDept(row.deptId);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {
        });
    }


    /** 导入按钮操作 */
    function handleImport() {
        upload.title = '行政区域导入';
        upload.open = true;
    }

    /** 下载模板操作 */
    function importTemplate() {
        proxy.download(
            'system/dept/importTemplate',
            {},
            `行政区域信息_${new Date().getTime()}.xlsx`,
        );
    }

    /**文件上传中处理 */
    const handleFileUploadProgress = (event, file, fileList) => {
        upload.isUploading = true;
        upload.loading = true;
    };
    /** 文件上传成功处理 */
    const handleFileSuccess = (response, file, fileList) => {
        upload.open = false;
        upload.isUploading = false;
        upload.loading = false;
        proxy.$refs['uploadRef'].handleRemove(file);
        proxy.$alert(
            "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;;max-width: 100vh;padding: 10px 20px 0;'>" +
            response.msg +
            '</div>',
            '导入结果',
            {dangerouslyUseHTMLString: true},
        );
        getList();
    };

    /** 提交上传文件 */
    function submitFileForm() {
        proxy.$refs['uploadRef'].submit();
    }

    getList();
</script>
