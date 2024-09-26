<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="商品名称" prop="name">
                <el-input
                        v-model="queryParams.name"
                        placeholder="商品名称"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="上架状态" prop="publishStatus">
                <el-select v-model="queryParams.publishStatus" placeholder="上架状态" clearable style="width: 200px">
                    <el-option
                            label="全部"
                            value=""
                    />
                    <el-option
                            label="上架"
                            value="1"
                    />
                    <el-option
                            label="下架"
                            value="0"
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
                        @click="handleAdd"
                        v-hasPermi="['merchant:Goods:sponsor:add']"
                >新增商品
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
            <el-table-column label="id" align="center" prop="id"/>
            <el-table-column label="商品名称" align="center" prop="name"/>
            <el-table-column label="价格" align="center" prop="price"/>
            <el-table-column label="上架状态" align="center" key="publishStatus">
                <template #default="scope">
                    <el-switch
                            v-model="scope.row.publishStatus"
                            active-value="1"
                            inactive-value="0"
                            @change="handleStatusChange(scope.row)"
                    ></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="品牌名称" align="center" prop="brandName"/>
            <el-table-column label="商品分类名称" align="center" prop="productCategoryName"/>
            <el-table-column label="库存" align="center" prop="kc"/>
            <el-table-column label="单位" align="center" prop="unit"/>
            <el-table-column label="商品重量" align="center" prop="weight"/>
            <el-table-column label="排序" align="center" prop="sort"/>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" @click="handleUpdate(scope.row)"
                               v-hasPermi="['merchant:news:edit']">{{scope.row.publishStatus == '0' ? '修改' : '查看'}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNo"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
        />

        <el-dialog :title="title" v-model="open" width="1280px" append-to-body>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="商品名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入商品名称" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="品牌名称" prop="brandName">
                    <el-input v-model="form.brandName" placeholder="请输入品牌名称" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="商品分类名称" prop="productCategoryName">
                    <el-input v-model="form.productCategoryName" placeholder="请输入商品分类名称" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="商品库存" prop="kc">
                    <el-input v-model="form.kc" type="number" placeholder="请输入商品库存" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="商品价格" prop="price">
                    <el-input v-model="form.price" type="number" placeholder="请输入商品价格" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="商品单位" prop="unit">
                    <el-input v-model="form.unit" placeholder="请输入商品单位" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="商品重量" prop="weight">
                    <el-input v-model="form.weight" placeholder="请输入商品重量" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input v-model="form.sort" type="number" placeholder="请输入排序" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="商品详情" prop="detailHtml">
                    <Tinymce v-if="open" ref="editor" v-model="form.detailHtml"/>
                </el-form-item>
                <el-form-item label="移动端商品详情" prop="detailMobileHtml">
                    <Tinymce v-if="open" ref="editor" v-model="form.detailMobileHtml"/>
                </el-form-item>
                <el-form-item label="主图" prop="picModels">
                    <imageUpload v-model="form.picModels" :isShowTip="false" :fileSize="false" :limit="1"/>
                </el-form-item>
                <el-form-item label="画册图片" prop="albumPicsModels">
                    <imageUpload v-model="form.albumPicsModels" :isShowTip="false" :fileSize="false" :limit="5"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm" v-if="!form.id || form.publishStatus != '1'">确 定
                    </el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Notice">
    import {
        addGoods,
        changeGoodsStatus,
        delGoods,
        getGoods,
        listGoods,
        listGoodsAll,
        updateGoods
    } from "@/api/goods/index";

    const {proxy} = getCurrentInstance();

    const dataList = ref([]);
    const open = ref(false);
    const loading = ref(true);
    const showSearch = ref(true);
    const ids = ref([]);
    const single = ref(true);
    const multiple = ref(true);
    const total = ref(0);
    const title = ref("");
    const listGoodsAllData = ref([]);

    const data = reactive({
        form: {},
        queryParams: {
            pageNo: 1,
            pageSize: 10,
            isAdmin: '1'
        },
        rules: {
            name: [{required: true, message: "商品名称不能为空", trigger: "blur"}],
            sort: [{required: true, message: "排序不能为空", trigger: "blur"}],
            kc: [{required: true, message: "库存不能为空", trigger: "blur"}],
            price: [{required: true, message: "商品价格不能为空", trigger: "blur"}],
            unit: [{required: true, message: "商品单位不能为空", trigger: "blur"}],
            weight: [{required: true, message: "商品重量不能为空", trigger: "change"}],
            detailHtml: [{required: true, message: "商品详情不能为空", trigger: "change"}],
            // pic: [{required: true, message: "主图不能为空", trigger: "change"}],
        },
    });

    const {queryParams, form, rules} = toRefs(data);
    
    

    /** 查询列表 */
    function getList() {
        loading.value = true;
        listGoods(queryParams.value).then(response => {
            dataList.value = response.data.records;
            total.value = response.data.total;
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
        };
        proxy.resetForm("formRef");
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        queryParams.value.pageNo = 1;
        getList();
    }

    /** 重置按钮操作 */
    function resetQuery() {
        proxy.resetForm("queryRef");
        handleQuery();
    }

    /** 多选框选中数据 */
    function handleSelectionChange(selection) {
        ids.value = selection.map(item => item.id);
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
        const id = row.id || ids.value;
        getGoods(id).then(response => {
            form.value = response.data;
            open.value = true;
            title.value = row.status == '1' ? '查看' : '修改';
        });
    }

    /** 提交按钮 */
    function submitForm() {
        proxy.$refs["formRef"].validate(valid => {
            if (valid) {
                form.value = {
                    ...form.value,
                    isAdmin : 1
                }
                if (form.value.id) {
                    updateGoods(form.value).then(response => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    });
                } else {
                    addGoods(form.value).then(response => {
                        proxy.$modal.msgSuccess("新增成功");
                        open.value = false;
                        getList();
                    });
                }
            }
        });
    }



    /** 上下架状态修改  */
    function handleStatusChange(row) {
        let text = row.publishStatus === "0" ? "下架" : "上架";
        proxy.$modal.confirm('确认要"' + text + '"?').then(function () {
            return changeGoodsStatus(row.id,row.publishStatus);
        }).then(() => {
            proxy.$modal.msgSuccess(text + "成功");
        }).catch(function () {
            row.publishStatus = row.publishStatus === "0" ? "1" : "0";
        });
    }

    getList();

</script>
