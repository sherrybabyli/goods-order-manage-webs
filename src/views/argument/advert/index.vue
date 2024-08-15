<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="广告名称" prop="advertName">
                <el-input
                        v-model="queryParams.advertName"
                        placeholder="请输入广告名称"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="广告位置" prop="positionType">
                <el-select v-model="queryParams.positionType" placeholder="广告位置" clearable style="width: 200px">
                    <el-option
                            v-for="dict in sys_advert_position_type"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 200px">
                    <el-option
                            v-for="dict in up_down_status"
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
                        v-hasPermi="['argument:advert:add']"
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
                        v-hasPermi="['argument:advert:edit']"
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
                        v-hasPermi="['argument:advert:remove']"
                >删除
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="noticeList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="序号" align="center" prop="advertId" width="60"/>
            <el-table-column label="广告名称" align="center" prop="advertName"/>
            <el-table-column label="广告图片" align="center" prop="imgUrl">
                <template #default="scope">
                    <el-image
                            style="width: 100px; height: 100px"
                            :src="scope.row.imgUrl"
                            :zoom-rate="1.2"
                            fit="cover"
                    />
                </template>
            </el-table-column>
            <el-table-column label="链接类型" align="center" prop="linkType">
                <template #default="scope">
                    <dict-tag :options="sys_advert_link_type" :value="scope.row.linkType"/>
                </template>
            </el-table-column>
            <el-table-column label="链接地址" align="center" prop="url"/>
            <el-table-column label="广告位置" align="center" prop="positionType">
                <template #default="scope">
                    <dict-tag :options="sys_advert_position_type" :value="scope.row.positionType"/>
                </template>
            </el-table-column>
            <el-table-column label="排序" align="center" prop="sort"/>

            <el-table-column label="状态" align="center" key="status">
                <template #default="scope">
                    <!--<dict-tag :options="up_down_status" :value="scope.row.status"/>-->
                    <el-switch
                            v-model="scope.row.status"
                            active-value="1"
                            inactive-value="0"
                            @change="handleStatusChange(scope.row)"
                    ></el-switch>
                </template>
            </el-table-column>

            <el-table-column label="更新者" align="center" prop="updateBy"/>
            <el-table-column label="更新时间" align="center" prop="updateTime"/>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['argument:advert:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['argument:advert:remove']">删除
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

        <!-- 添加或修改广告对话框 -->
        <el-dialog :title="title" v-model="open" width="780px" append-to-body>
            <el-form ref="noticeRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="广告名称" prop="advertName">
                    <el-col :span="15">
                        <el-input v-model="form.advertName" placeholder="请输入广告名称"/>
                    </el-col>
                </el-form-item>
                <el-form-item label="广告图片" prop="imgModel">
                    <imageUpload v-model="form.imgModel" :isShowTip="false" :fileSize="false" :limit="1"/>
                </el-form-item>

                <el-form-item label="链接类型" prop="linkType">
                    <el-select v-model="form.linkType" placeholder="请选择">
                        <el-option
                                v-for="dict in sys_advert_link_type"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="广告位置" prop="positionType">
                    <el-select v-model="form.positionType" placeholder="请选择">
                        <el-option
                                v-for="dict in sys_advert_position_type"
                                :key="dict.value"
                                :label="dict.label"
                                :value="dict.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="form.status" placeholder="请选择">
                        <el-radio
                                v-for="dict in up_down_status"
                                :key="dict.value"
                                :label="dict.value"
                        >{{ dict.label }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="链接地址" prop="url" v-if="form.linkType == 1 || form.linkType == 2">
                    <el-col :span="15">
                        <el-input v-model="form.url" placeholder="请输入链接地址"/>
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
    </div>
</template>

<script setup name="Notice">
    import {addAdvert, changeAdvertStatus, delAdvert, getAdvert, listAdvert, updateAdvert} from "@/api/system/advert";

    const {proxy} = getCurrentInstance();
    const {up_down_status, sys_advert_position_type, sys_advert_link_type} = proxy.useDict("up_down_status", "sys_advert_position_type", "sys_advert_link_type");

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
            advertName: undefined,
            linkType: undefined,
            updateBy: undefined,
            status: undefined
        },
        rules: {
            advertName: [{required: true, message: "广告标题不能为空", trigger: "blur"}],
            positionType: [{required: true, message: "广告位置不能为空", trigger: "change"}],
            imgModel: [{required: true, message: "广告图片不能为空", trigger: "change"}],
            linkType: [{required: true, message: "链接类型不能为空", trigger: "change"}],
            url: [{required: true, message: "链接地址不能为空", trigger: "change"}]
        },
    });

    const {queryParams, form, rules} = toRefs(data);

    /** 查询广告列表 */
    function getList() {
        loading.value = true;
        listAdvert(queryParams.value).then(response => {
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
            advertId: undefined,
            advertName: undefined,
            imgModel: undefined,
            positionType: undefined,
            noticeContent: undefined,
            linkType: undefined,
            status: "1"
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
        ids.value = selection.map(item => item.advertId);
        single.value = selection.length != 1;
        multiple.value = !selection.length;
    }

    /** 新增按钮操作 */
    function handleAdd() {
        reset();
        open.value = true;
        title.value = "添加广告";
    }

    /**修改按钮操作 */
    function handleUpdate(row) {
        reset();
        const advertId = row.advertId || ids.value;
        getAdvert(advertId).then(response => {
            form.value = response.data;
            open.value = true;
            title.value = "修改广告";
        });
    }

    /** 提交按钮 */
    function submitForm() {
        proxy.$refs["noticeRef"].validate(valid => {
            if (valid) {
                if (form.value.advertId != undefined) {
                    updateAdvert(form.value).then(response => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    });
                } else {
                    addAdvert(form.value).then(response => {
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
        const advertIds = row.advertId || ids.value
        proxy.$modal.confirm('是否确认删除广告编号为"' + advertIds + '"的数据项？').then(function () {
            return delAdvert(advertIds);
        }).then(() => {
            getList();
            proxy.$modal.msgSuccess("删除成功");
        }).catch(() => {
        });
    }


    /** 上下架状态修改  */
    function handleStatusChange(row) {
        let text = row.status === "0" ? "下架" : "上架";
        proxy.$modal.confirm('确认要"' + text + '"?').then(function () {
            return changeAdvertStatus(row.advertId, row.status);
        }).then(() => {
            proxy.$modal.msgSuccess(text + "成功");
        }).catch(function () {
            row.status = row.status === "0" ? "1" : "0";
        });
    }

    /** 表单重置 */
    function resetImg() {
        form.value = {
            file: undefined,
        };
        proxy.resetForm("ossRef");
    }

    getList();
</script>
