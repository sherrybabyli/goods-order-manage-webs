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
                            v-model="scope.row.activeStatus"
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
                               v-hasPermi="['merchant:news:edit']">{{scope.row.status == '0' ? '修改' : '查看'}}
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

        <el-dialog :title="title" v-model="open" width="1280px" append-to-body>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="活动名称" prop="GoodsName">
                    <el-input v-model="form.GoodsName" placeholder="请输入活动名称" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="主办方" prop="organizer">
                    <el-input
                            v-model="form.organizer"
                            placeholder="主办方"
                            style="width: 200px"
                    />
                </el-form-item>
                <el-form-item label="承办方" prop="undertaker">
                    <el-input
                            v-model="form.undertaker"
                            placeholder="承办方"
                            style="width: 200px"
                    />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input v-model="form.sort" type="number" placeholder="请输入排序" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="关联赞助活动（非必填）" prop="relatedGoodsId">
                    <el-select filterable v-model="form.relatedGoodsId" placeholder="活动" clearable style="width: 200px">
                        <el-option
                                v-for="dict in listGoodsAllData"
                                :key="dict.GoodsId"
                                :label="dict.GoodsName"
                                :value="dict.GoodsId"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="报名方式" prop="signUpType">
                    <el-radio-group v-model="form.signUpType" @change="onRadioChange">
                        <el-radio label="1" size="large">免费</el-radio>
                        <el-radio label="2" size="large">付费</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="付费金额" prop="payAmount" v-if="form.signUpType == '2'">
                    <el-input v-model="form.payAmount" type="number" placeholder="请输入付费金额" style="width: 200px;"/>
                </el-form-item>
                <el-form-item label="活动级别" prop="GoodsLevel">
                    <el-select v-model="form.GoodsLevel" placeholder="活动级别" clearable style="width: 200px">
                        <el-option
                                label="全部"
                                value=""
                        />
                        <el-option
                                label="省级"
                                value="1"
                        />
                        <el-option
                                label="市级"
                                value="2"
                        />
                        <el-option
                                label="区县级"
                                value="3"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="报名开始时间" prop="signUpStartTime">
                    <el-date-picker
                            v-model="form.signUpStartTime"
                            type="datetime"
                            placeholder="报名开始时间"
                            style="width: 100%"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="报名结束时间" prop="signUpEndTime">
                    <el-date-picker
                            v-model="form.signUpEndTime"
                            type="datetime"
                            placeholder="报名结束时间"
                            style="width: 100%"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="活动开始时间" prop="GoodsStartTime">
                    <el-date-picker
                            v-model="form.GoodsStartTime"
                            type="datetime"
                            placeholder="报名开始时间"
                            style="width: 100%"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="活动结束时间" prop="GoodsEndTime">
                    <el-date-picker
                            v-model="form.GoodsEndTime"
                            type="datetime"
                            placeholder="活动结束时间"
                            style="width: 100%"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="活动介绍" prop="GoodsIntro">
                    <Tinymce v-if="open" ref="editor" v-model="form.GoodsIntro"/>
                </el-form-item>
                <el-form-item label="封面图" prop="imgModels">
                    <imageUpload v-model="form.imgModels" :isShowTip="false" :fileSize="false" :limit="1"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm" v-if="!form.GoodsId || form.status != '1'">确 定
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
            pageNum: 1,
            pageSize: 10,
            GoodsType: '2'
        },
        rules: {
            GoodsName: [{required: true, message: "活动名称不能为空", trigger: "blur"}],
            sort: [{required: true, message: "排序不能为空", trigger: "blur"}],
            signUpType: [{required: true, message: "报名方式不能为空", trigger: "change"}],
            GoodsLevel: [{required: true, message: "活动级别不能为空", trigger: "change"}],
            signUpStartTime: [{required: true, message: "报名开始时间不能为空", trigger: "change"}],
            signUpEndTime: [{required: true, message: "报名结束时间不能为空", trigger: "change"}],
            GoodsStartTime: [{required: true, message: "活动开始时间不能为空", trigger: "change"}],
            GoodsEndTime: [{required: true, message: "活动结束时间不能为空", trigger: "change"}],
            sponsorIntro: [{required: true, message: "赞助介绍不能为空", trigger: "blur"}],
            GoodsIntro: [{required: true, message: "活动介绍不能为空", trigger: "blur"}],
            imgModels: [{required: true, message: "封面图不能为空", trigger: "change"}],
            payAmount: [{required: true, message: "付费金额不能为空", trigger: "blur"}],
        },
    });

    const {queryParams, form, rules} = toRefs(data);

    function onRadioChange() {
        form.value.payAmount = ''
    }

    function handleExport() {
        proxy.download("Goods/info/export", {
            ...queryParams.value,
        }, `活动信息_${new Date().getTime()}.xlsx`);
    }

    /** 查询广告列表 */
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
            status: "1",
            conditionType: '1'
        };
        proxy.resetForm("formRef");
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
        ids.value = selection.map(item => item.GoodsId);
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
        const id = row.GoodsId || ids.value;
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
                    GoodsType: '2'
                }
                if (form.value.GoodsId) {
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
        let text = row.status === "0" ? "下架" : "上架";
        proxy.$modal.confirm('确认要"' + text + '"?').then(function () {
            return changeGoodsStatus(row.id,row.publishStatus === "0" ? "1" : "0");
        }).then(() => {
            proxy.$modal.msgSuccess(text + "成功");
        }).catch(function () {
            row.status = row.status === "0" ? "1" : "0";
        });
    }

    getList();

    function getListGoodsAll() {
        listGoodsAll({GoodsType: '1'}).then(response => {
            listGoodsAllData.value = response.data
        });
    }

    getListGoodsAll()
</script>
