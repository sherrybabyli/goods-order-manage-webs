<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" @submit.native.prevent>
            <el-form-item label="" prop="categoryName">
                <el-input
                        v-model="queryParams.categoryName"
                        placeholder="分类名称"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
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

        <el-table v-loading="loading" :data="categoryList">

            <el-table-column label="排序" align="center" prop="sort"/>
            <el-table-column label="分类名称" align="center" prop="categoryName"/>
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

        <!-- 添加或修改问题分类对话框 -->
        <el-dialog :title="title" v-model="open" width="600px" append-to-body>
            <el-form ref="categoryRef" :model="form" :rules="rules" label-width="80px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="分类名称" prop="categoryName">
                            <el-input v-model="form.categoryName" placeholder="请输入分类名称"/>
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

<script setup name="Category">
    import {addCategory, delCategory, getCategory, listCategory, updateCategory} from "@/api/system/issueCategory";

    const {proxy} = getCurrentInstance();

    const categoryList = ref([]);
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

    const data = reactive({
        form: {},
        queryParams: {
            pageNum: 1,
            pageSize: 10,
        },
        rules: {
            categoryName: [
                {required: true, message: "分类名称不能为空", trigger: "blur"},
                {
                    min: 2,
                    max: 60,
                    message: '长度必须介于 2 和 60 之间',
                    trigger: 'blur',
                },],
        },
    });

    const {queryParams, form, rules} = toRefs(data);

    /** 查询问题分类列表 */
    function getList() {
        loading.value = true;
        listCategory(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
            categoryList.value = response.rows;
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
            categoryId: undefined
        };
        proxy.resetForm("categoryRef");
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
        ids.value = selection.map(item => item.categoryId);
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
        const categoryId = row.categoryId || ids.value;
        getCategory(categoryId).then(response => {
            isPublish.value = response.data.status;
            form.value = response.data;
            open.value = true;
            title.value = "修改";
        });
    }

    /** 提交按钮 */
    function submitForm() {
        proxy.$refs["categoryRef"].validate(valid => {
            if (valid) {
                if (form.value.categoryId != undefined) {
                    updateCategory(form.value).then(response => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    });
                } else {
                    addCategory(form.value).then(response => {
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
        const categoryId = row.categoryId
        proxy.$modal.confirm('确认删除？').then(function () {
            return delCategory(categoryId);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {
        });
    }

    getList();
</script>
