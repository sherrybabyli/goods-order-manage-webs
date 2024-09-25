<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="订单编号" prop="orderNo">
                <el-input
                        v-model="queryParams.orderNo"
                        placeholder="订单编号"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="微信交易号" prop="outOrderNo">
                <el-input
                        v-model="queryParams.outOrderNo"
                        placeholder="微信交易号"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="注册手机号" prop="phone">
                <el-input
                        v-model="queryParams.phone"
                        placeholder="注册手机号"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="支付状态" prop="userName">
                <el-select v-model="queryParams.status" placeholder="支付状态" clearable style="width: 200px">
                    <el-option
                            label="全部"
                            value=""
                    />
                    <el-option
                            label="未支付"
                            value="0"
                    />
                    <el-option
                            label="支付中"
                            value="1"
                    />
                    <el-option
                            label="支付成功"
                            value="2"
                    />
                    <el-option
                            label="支付失败"
                            value="3"
                    />
                    <el-option
                            label="退款中"
                            value="4"
                    />
                    <el-option
                            label="已部分退款"
                            value="5"
                    />
                    <el-option
                            label="已退款"
                            value="6"
                    />
                    <el-option
                            label="订单取消"
                            value="9"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="支付时间" prop="startRegisterTime">
                <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                ></el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        @click="handleExport"
                        v-hasPermi="['order:user:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
            <el-table-column label="订单编号" align="center" prop="orderNo"/>
            <el-table-column label="微信交易号" align="center" prop="outOrderNo"/>
            <el-table-column label="订单类型" align="center" prop="orderType"/>
            <el-table-column label="注册手机号" align="center" prop="phone"/>
            <el-table-column label="活动名称" align="center" prop="eventName"/>
            <el-table-column label="支付金额" align="center" prop="amount"/>
            <el-table-column label="支付状态" align="center" prop="orderStatus">
                <template #default="scope">
                    <div v-if="scope.row.orderStatus == '0'">未支付</div>
                    <div v-if="scope.row.orderStatus == '1'">支付中</div>
                    <div v-if="scope.row.orderStatus == '2'">支付成功</div>
                    <div v-if="scope.row.orderStatus == '3'">支付失败</div>
                    <div v-if="scope.row.orderStatus == '4'">退款中</div>
                    <div v-if="scope.row.orderStatus == '5'">已部分退款</div>
                    <div v-if="scope.row.orderStatus == '6'">已退款</div>
                    <div v-if="scope.row.orderStatus == '9'">订单取消</div>
                </template>
            </el-table-column>
            <el-table-column label="支付时间" align="center" prop="payTime"/>
        </el-table>

        <pagination
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
        />
    </div>
</template>

<script setup name="Notice">
    import {pageUserList} from "@/api/order/index";

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
    const dateRange = ref([]);

    const data = reactive({
        form: {},
        queryParams: {
            pageNum: 1,
            pageSize: 10,
            status: undefined
        },
        rules: {
            // roles: [{required: true, message: "不能为空", trigger: "change"}],
        },
    });

    const {queryParams, form, rules} = toRefs(data);

    function handleExport() {
        if (dateRange.value.length) {
            queryParams.value.startPayTime = dateRange.value[0];
            queryParams.value.endPayTime = dateRange.value[1];
        } else {
            queryParams.value.startPayTime = ''
            queryParams.value.endPayTime = ''
        }
        proxy.download("system/orderManage/userOrderExport", {
            ...queryParams.value,
        }, `用户订单数据_${new Date().getTime()}.xlsx`);
    }

    function getList() {
        loading.value = true;
        if (dateRange.value.length) {
            queryParams.value.startPayTime = dateRange.value[0];
            queryParams.value.endPayTime = dateRange.value[1];
        } else {
            queryParams.value.startPayTime = ''
            queryParams.value.endPayTime = ''
        }
        pageUserList(queryParams.value).then(response => {
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
            status: "1"
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
        dateRange.value = [];
        proxy.resetForm("queryRef");
        handleQuery();
    }
    getList();
</script>
