<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="" prop="title">
                <el-input
                        v-model="queryParams.title"
                        placeholder="问题描述"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item prop="categoryId">
                <el-select
                        v-model="queryParams.categoryId"
                        placeholder="问题分类"
                        clearable
                        style="width: 240px"
                >
                    <el-option
                            v-for="category in categoryOptions"
                            :label="category.categoryName"
                            :value="category.categoryId"
                            :key="category.categoryId"
                    ></el-option>
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
                >新增
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="issueList">

            <el-table-column label="排序" align="center" prop="sort"/>
            <el-table-column label="所属分类" align="center" prop="categoryName"/>
            <el-table-column label="问题描述" align="center" prop="title"/>
            <el-table-column label="更新时间" align="center" prop="updateTime"/>
            <el-table-column label="更新人" align="center" prop="updateBy"/>


            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" @click="handleUpdate(scope.row)">编辑
                    </el-button>
                    <el-button link type="primary" @click="handleDelete(scope.row)">删除
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

        <!-- 添加或修改问题对话框 -->
        <el-dialog :title="title" v-model="open" width="780px" append-to-body>
            <el-form ref="issueRef" :model="form" :rules="rules" label-width="80px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="问题描述" prop="title">
                            <el-input v-model="form.title" placeholder="请输入问题描述"/>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="问题分类" prop="categoryId">
                            <el-select
                                    v-model="form.categoryId"
                                    placeholder="请选择问题分类"
                                    style="width: 100%"
                            >
                                <el-option
                                        v-for="item in categoryOptions"
                                        :key="item.categoryId"
                                        :label="item.categoryName"
                                        :value="item.categoryId"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="问题解答" prop="content">
                            <Tinymce v-if="open" ref="editor" v-model="form.content"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="排序" prop="sort">
                            <el-input-number v-model="form.sort" controls-position="right" :min="0"/>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Issue">
    import {addIssue, delIssue, getCategorys, getIssue, listIssue, updateIssue} from "@/api/system/issue";

    const {proxy} = getCurrentInstance();

    const issueList = ref([]);
    const open = ref(false);
    const loading = ref(true);
    const showSearch = ref(true);
    const ids = ref([]);
    const single = ref(true);
    const multiple = ref(true);
    const total = ref(0);
    const title = ref("");
    const isPublish = ref('');
    const dateRange = ref([]);
    const categoryOptions = ref([]);

    const data = reactive({
        form: {},
        queryParams: {
            pageNum: 1,
            pageSize: 10,
        },
        rules: {
            title: [
                {required: true, message: "问题描述不能为空", trigger: "blur"},
                {
                    min: 2,
                    max: 60,
                    message: '长度必须介于 2 和 60 之间',
                    trigger: 'blur',
                },],
            categoryId: [
                {required: true, message: "请选择问题分类", trigger: "change"}],
            content: [
                {required: true, message: "请输入问题解答", trigger: "blur"}],
        },
    });

    const {queryParams, form, rules} = toRefs(data);

    /** 查询问题列表 */
    function getList() {
        loading.value = true;
        listIssue(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
            issueList.value = response.rows;
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
            issueId: undefined
        };
        proxy.resetForm("issueRef");
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        queryParams.value.pageNum = 1;
        getList();
    }

    /** 重置按钮操作 */
    function resetQuery() {
        dateRange.value = [];
        proxy.resetForm("queryRef");
        handleQuery();
    }

    /** 多选框选中数据 */
    function handleSelectionChange(selection) {
        ids.value = selection.map(item => item.issueId);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }

    /** 新增按钮操作 */
    function handleAdd() {
        reset();
        open.value = true;
        title.value = "新增";
    }

    /**修改按钮操作 */
    function handleUpdate(row) {
        reset();
        const issueId = row.issueId || ids.value;
        getIssue(issueId).then(response => {
            isPublish.value = response.data.status;
            form.value = response.data;
            open.value = true;
            title.value = "修改";
        });
    }

    /** 提交按钮 */
    function submitForm() {
        proxy.$refs["issueRef"].validate(valid => {
            if (valid) {
                if (form.value.issueId != undefined) {
                    updateIssue(form.value).then(response => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    });
                } else {
                    addIssue(form.value).then(response => {
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
        const issueId = row.issueId
        proxy.$modal.confirm('删除后不可恢复，确认是否删除？').then(function () {
            return delIssue(issueId);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {
        });
    }

    /** 获取问题分类列表 */
    function getCategoryList() {
        getCategorys().then(response => {
            categoryOptions.value = response.data;
        });
    }

    getList();
    getCategoryList();
</script>
