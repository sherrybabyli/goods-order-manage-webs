<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="项目名称" prop="projectName">
                <el-input
                        v-model="queryParams.projectName"
                        placeholder="请输入项目名称"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 200px">
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
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                        type="primary"
                        plain
                        icon="Plus"
                        @click="handleAdd"
                        v-hasPermi="['system:project:add']"
                >新增
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="success"
                        plain
                        icon="Edit"
                        :disabled="single"
                        @click="handleUpdate"
                        v-hasPermi="['system:project:edit']"
                >修改
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="danger"
                        plain
                        icon="Delete"
                        :disabled="multiple"
                        @click="handleDelete"
                        v-hasPermi="['system:project:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="info"
                        plain
                        icon="Upload"
                        @click="handleImport"
                        v-hasPermi="['system:project:import']"
                >导入
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="noticeList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="项目名称" align="center" prop="projectName"/>
            <el-table-column label="排序" align="center" prop="sort"/>


            <el-table-column label="状态" align="center" key="status">
                <template #default="scope">
                    <!--<dict-tag :options="sys_normal_disable" :value="scope.row.status"/>-->
                    <el-switch
                            v-model="scope.row.status"
                            active-value="0"
                            inactive-value="1"
                            @change="handleStatusChange(scope.row)"
                    ></el-switch>
                </template>
            </el-table-column>

            <el-table-column label="更新者" align="center" prop="updateBy"/>
            <el-table-column label="更新时间" align="center" prop="updateTime"/>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['system:project:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['system:project:remove']">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
        />

        <!-- 添加或修改项目对话框 -->
        <el-dialog :title="title" v-model="open" width="780px" append-to-body>
            <el-form ref="noticeRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="项目名称" prop="projectName">

                    <el-col :span="15">
                        <el-input v-model="form.projectName" placeholder="请输入项目名称"/>
                    </el-col>
                </el-form-item>
                <el-form-item label="状态">
                    <el-col :span="15">
                    <el-radio-group v-model="form.status" placeholder="请选择">
                        <el-radio
                                v-for="dict in sys_normal_disable"
                                :key="dict.value"
                                :label="dict.value"
                        >{{ dict.label }}
                        </el-radio>
                    </el-radio-group>
                    </el-col>
                </el-form-item>
                <el-form-item label="显示排序" prop="sort">
                    <el-input-number v-model="form.sort" controls-position="right" :min="0"/>
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

<script setup name="Notice">
    import {getToken} from "@/utils/auth";
    import {
        addProject,
        changeProjectStatus,
        delProject,
        getProject,
        listProject,
        updateProject
    } from "@/api/system/project";

    const {proxy} = getCurrentInstance();
    const {sys_normal_disable} = proxy.useDict("sys_normal_disable");

    const noticeList = ref([]);
    const open = ref(false);
    const loading = ref(true);
    const showSearch = ref(true);
    const ids = ref([]);
    const single = ref(true);
    const multiple = ref(true);
    const total = ref(0);
    const title = ref("");

    const data = reactive({
        form: {},
        queryParams: {
            pageNum: 1,
            pageSize: 10,
            projectName: undefined,
            updateBy: undefined,
            status: undefined
        },
        rules: {
            projectName: [{required: true, message: "项目不能为空", trigger: "blur"}],
        },
    });

    /*** 项目导入参数 */
    const upload = reactive({
        // 是否显示弹出层（项目导入）
        open: false,
        loading: false,
        // 弹出层标题（项目导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {Authorization: "Bearer " + getToken()},
        // 上传的地址
        url: import.meta.env.VITE_APP_BASE_API + "/system/project/importData"
    });

    const {queryParams, form, rules} = toRefs(data);

    /** 查询项目列表 */
    function getList() {
        loading.value = true;
        listProject(queryParams.value).then(response => {
            noticeList.value = response.rows;
            total.value = response.total;
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
            projectId: undefined,
            projectName: undefined,
            status: "0"
        };
        proxy.resetForm("noticeRef");
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        queryParams.value.pageNum = 1;
        getList();
    }

    /** 重置按钮操作 */
    function resetQuery() {
        proxy.resetForm("queryRef");
        handleQuery();
    }

    /** 多选框选中数据 */
    function handleSelectionChange(selection) {
        ids.value = selection.map(item => item.projectId);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }

    /** 新增按钮操作 */
    function handleAdd() {
        reset();
        open.value = true;
        title.value = "添加项目";
    }

    /**修改按钮操作 */
    function handleUpdate(row) {
        reset();
        const projectId = row.projectId || ids.value;
        getProject(projectId).then(response => {
            form.value = response.data;
            open.value = true;
            title.value = "修改项目";
        });
    }

    /** 提交按钮 */
    function submitForm() {
        proxy.$refs["noticeRef"].validate(valid => {
            if (valid) {
                if (form.value.projectId != undefined) {
                    updateProject(form.value).then(response => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    });
                } else {
                    addProject(form.value).then(response => {
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
        const projectIds = row.projectId || ids.value
        proxy.$modal.confirm('是否确认删除项目编号为"' + projectIds + '"的数据项？').then(function () {
            return delProject(projectIds);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {
        });
    }


    /** 上下架状态修改  */
    function handleStatusChange(row) {
        let text = row.status === "0" ? "开启" : "禁用";
        proxy.$modal.confirm('确认要"' + text + '"?').then(function () {
            return changeProjectStatus(row.projectId, row.status);
        }).then(() => {
            proxy.$modal.msgSuccess(text + "成功");
        }).catch(function () {
            row.status = row.status === "0" ? "1" : "0";
        });
    }

    /** 导入按钮操作 */
    function handleImport() {
        upload.title = "项目导入";
        upload.open = true;
    };

    /** 下载模板操作 */
    function importTemplate() {
        proxy.download("system/project/importTemplate", {}, `指导项目_${new Date().getTime()}.xlsx`);
    };

    /** 提交上传文件 */
    function submitFileForm() {
        proxy.$refs["uploadRef"].submit();
    };
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
        proxy.$refs["uploadRef"].handleRemove(file);
        proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", {dangerouslyUseHTMLString: true});
        getList();
    };


    getList();
</script>
