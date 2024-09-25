<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="活动名称" prop="eventsName">
                <el-input
                        v-model="queryParams.eventsName"
                        placeholder="活动名称"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="主办方" prop="organizer">
                <el-input
                        v-model="queryParams.organizer"
                        placeholder="主办方"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="活动级别" prop="eventsLevel">
                <el-select v-model="queryParams.eventsLevel" placeholder="活动级别" clearable style="width: 200px">
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
            <el-form-item label="活动状态" prop="activeStatus">
                <el-select v-model="queryParams.activeStatus" placeholder="活动状态" clearable style="width: 200px">
                    <el-option
                            label="未开始"
                            value="0"
                    />
                    <el-option
                            label="进行中"
                            value="2"
                    />
                    <el-option
                            label="已结束"
                            value="1"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="报名方式" prop="signUpType">
                <el-select v-model="queryParams.signUpType" placeholder="报名方式" clearable style="width: 200px">
                    <el-option
                            label="免费"
                            value="1"
                    />
                    <el-option
                            label="付费"
                            value="2"
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
                        @click="handleAdd"
                        v-hasPermi="['merchant:events:sponsor:add']"
                >发布活动
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        @click="handleExport"
                        v-hasPermi="['merchant:events:sponsor:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
            <el-table-column label="活动名称" align="center" prop="eventsName"/>
            <el-table-column label="活动级别" align="center" prop="eventsLevel">
                <template #default="scope">
                    <span>{{ scope.row.eventsLevel == '1' ? '省级' : scope.row.eventsLevel == '2' ? '市级' : '区县级' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="报名时间" align="center" prop="eventsStartTime">
                <template #default="scope">
                    <span>{{ scope.row.signUpStartTime }} - {{ scope.row.signUpEndTime }}</span>
                </template>
            </el-table-column>
            <el-table-column label="活动时间" align="center" prop="eventsStartTime">
                <template #default="scope">
                    <span>{{ scope.row.eventsStartTime }} - {{ scope.row.eventsEndTime }}</span>
                </template>
            </el-table-column>
            <el-table-column label="报名方式" align="center" prop="signUpType">
                <template #default="scope">
                    <span>{{ scope.row.signUpType == '1' ? '免费' : '付费' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="报名金额" align="center" prop="payAmount">
                <template #default="scope">
                    <span>{{ scope.row.payAmount }}￥</span>
                </template>
            </el-table-column>
            <el-table-column label="活动状态" align="center" prop="activeStatus">
                <template #default="scope">
                    <span>{{ scope.row.activeStatus == '0' ? '未开始' : scope.row.activeStatus == '1' ? '进行中' : '已结束' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="主办方" align="center" prop="organizer"/>
            <el-table-column label="关联赞助活动" align="center" prop="relatedEventsName"/>
            <el-table-column label="排序" align="center" prop="sort"/>
            <el-table-column label="上架状态" align="center" key="status">
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
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" @click="handleUpdate(scope.row)"
                               v-hasPermi="['merchant:news:edit']">{{scope.row.status == '0' ? '修改' : '查看'}}
                    </el-button>
                    <el-button link type="primary" @click="handleDelete(scope.row)"
                               v-hasPermi="['merchant:news:remove']">删除
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
                <el-form-item label="活动名称" prop="eventsName">
                    <el-input v-model="form.eventsName" placeholder="请输入活动名称" style="width: 200px;"/>
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
                <el-form-item label="关联赞助活动（非必填）" prop="relatedEventsId">
                    <el-select filterable v-model="form.relatedEventsId" placeholder="活动" clearable style="width: 200px">
                        <el-option
                                v-for="dict in listEventsAllData"
                                :key="dict.eventsId"
                                :label="dict.eventsName"
                                :value="dict.eventsId"
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
                <el-form-item label="活动级别" prop="eventsLevel">
                    <el-select v-model="form.eventsLevel" placeholder="活动级别" clearable style="width: 200px">
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
                <el-form-item label="活动开始时间" prop="eventsStartTime">
                    <el-date-picker
                            v-model="form.eventsStartTime"
                            type="datetime"
                            placeholder="报名开始时间"
                            style="width: 100%"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="活动结束时间" prop="eventsEndTime">
                    <el-date-picker
                            v-model="form.eventsEndTime"
                            type="datetime"
                            placeholder="活动结束时间"
                            style="width: 100%"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="活动介绍" prop="eventsIntro">
                    <Tinymce v-if="open" ref="editor" v-model="form.eventsIntro"/>
                </el-form-item>
                <el-form-item label="封面图" prop="imgModels">
                    <imageUpload v-model="form.imgModels" :isShowTip="false" :fileSize="false" :limit="1"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm" v-if="!form.eventsId || form.status != '1'">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Notice">
    import {addEvents, changeEventsStatus, delEvents, getEvents, listEvents, updateEvents, listEventsAll} from "@/api/merchant/sponsor";

    const {proxy} = getCurrentInstance();
    const {up_down_status, sys_advert_position_type, sys_advert_link_type} = proxy.useDict("up_down_status", "sys_advert_position_type", "sys_advert_link_type");

    const dataList = ref([]);
    const open = ref(false);
    const loading = ref(true);
    const showSearch = ref(true);
    const ids = ref([]);
    const single = ref(true);
    const multiple = ref(true);
    const total = ref(0);
    const title = ref("");
    const listEventsAllData = ref([]);

    const data = reactive({
        form: {},
        queryParams: {
            pageNum: 1,
            pageSize: 10,
            eventsType: '2'
        },
        rules: {
            eventsName: [{required: true, message: "活动名称不能为空", trigger: "blur"}],
            sort: [{required: true, message: "排序不能为空", trigger: "blur"}],
            signUpType: [{required: true, message: "报名方式不能为空", trigger: "change"}],
            eventsLevel: [{required: true, message: "活动级别不能为空", trigger: "change"}],
            signUpStartTime: [{required: true, message: "报名开始时间不能为空", trigger: "change"}],
            signUpEndTime: [{required: true, message: "报名结束时间不能为空", trigger: "change"}],
            eventsStartTime: [{required: true, message: "活动开始时间不能为空", trigger: "change"}],
            eventsEndTime: [{required: true, message: "活动结束时间不能为空", trigger: "change"}],
            sponsorIntro: [{required: true, message: "赞助介绍不能为空", trigger: "blur"}],
            eventsIntro: [{required: true, message: "活动介绍不能为空", trigger: "blur"}],
            imgModels: [{required: true, message: "封面图不能为空", trigger: "change"}],
            payAmount: [{required: true, message: "付费金额不能为空", trigger: "blur"}],
        },
    });

    const {queryParams, form, rules} = toRefs(data);

    function onRadioChange() {
        form.value.payAmount = ''
    }
    function handleExport() {
        proxy.download("events/info/export", {
            ...queryParams.value,
        }, `活动信息_${new Date().getTime()}.xlsx`);
    }

    /** 查询广告列表 */
    function getList() {
        loading.value = true;
        listEvents(queryParams.value).then(response => {
            dataList.value = response.rows;
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
        ids.value = selection.map(item => item.eventsId);
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
        const id = row.eventsId || ids.value;
        getEvents(id).then(response => {
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
                    eventsType: '2'
                }
                if (form.value.eventsId) {
                    updateEvents(form.value).then(response => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    });
                } else {
                    addEvents(form.value).then(response => {
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
        const id = row.eventsId || ids.value
        proxy.$modal.confirm('是否确认删除？').then(function () {
            return delEvents(id);
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
            return changeEventsStatus(row.eventsId);
        }).then(() => {
            proxy.$modal.msgSuccess(text + "成功");
        }).catch(function () {
            row.status = row.status === "0" ? "1" : "0";
        });
    }

    getList();

    function getListEventsAll() {
        listEventsAll({eventsType: '1'}).then(response => {
            listEventsAllData.value = response.data
        });
    }
    getListEventsAll()
</script>
