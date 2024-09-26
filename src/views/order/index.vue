<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="会员ID" prop="memberId">
                <el-input
                        v-model="queryParams.memberId"
                        placeholder="会员ID"
                        clearable
                        style="width: 200px"
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="支付方式" prop="payType">
                <el-select v-model="queryParams.payType" placeholder="支付方式" clearable style="width: 200px">
                    <el-option
                            label="全部"
                            value=""
                    />
                    <el-option
                            label="未支付"
                            value="0"
                    />
                    <el-option
                            label="支付宝"
                            value="1"
                    />
                    <el-option
                            label="微信"
                            value="2"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="订单状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="订单状态" clearable style="width: 200px">
                    <el-option
                            label="全部"
                            value=""
                    />
                    <el-option
                            label="待付款"
                            value="0"
                    />
                    <el-option
                            label="待发货"
                            value="1"
                    />
                    <el-option
                            label="已发货"
                            value="2"
                    />
                    <el-option
                            label="已完成"
                            value="3"
                    />
                    <el-option
                            label="已关闭"
                            value="4"
                    />
                    <el-option
                            label="无效订单"
                            value="5"
                    />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
            <el-table-column label="订单编号" align="center" prop="orderSn"/>
            <el-table-column label="支付id" align="center" prop="payId"/>
            <el-table-column label="用户账号" align="center" prop="memberUsername"/>
            <el-table-column label="订单总金额" align="center" prop="totalAmount"/>
            <el-table-column label="采购价" align="center" prop="purchasePrice"/>
            <el-table-column label="应付金额" align="center" prop="payAmount"/>
            <el-table-column label="运费金额" align="center" prop="freightAmount"/>
            <el-table-column label="支付方式" align="center" prop="payType">
                <template #default="scope">
                    <span>{{ scope.row.payType == '1' ? '支付宝' : scope.row.payType == '2' ? '微信' : '未支付' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="订单状态" align="center" prop="status">
                <template #default="scope">
                    <span>{{ scope.row.status == '0' ? '待付款' : scope.row.status == '1' ? '待发货' : scope.row.status == '2' ? '已发货' : scope.row.status == '3' ? '已完成' :scope.row.status == '4' ? '已关闭' :'无效订单' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="退款状态" align="center" prop="aftersaleStatus">
                <template #default="scope">
                    <span>{{ scope.row.aftersaleStatus == '1' ? '无售后或售后关闭' : scope.row.aftersaleStatus == '2' ? '售后处理中' : scope.row.aftersaleStatus == '3' ? '退款中' : '退款成功' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="确认收货状态" align="center" prop="confirmStatus">
                <template #default="scope">
                    <span>{{ scope.row.confirmStatus == '0' ? '未确认' : '已确认' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="支付时间" align="center" prop="paymentTime">
                <template #default="scope">
                    <span>{{ scope.row.paymentTime }}</span>
                </template>
            </el-table-column>
            <el-table-column label="发货时间" align="center" prop="deliveryTime">
                <template #default="scope">
                    <span>{{ scope.row.deliveryTime }}</span>
                </template>
            </el-table-column>
            <el-table-column label="更新时间" align="center" prop="updateTime">
                <template #default="scope">
                    <span>{{ scope.row.updateTime }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作人" align="center" prop="updateBy">
                <template #default="scope">
                    <span>{{ scope.row.updateBy }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" @click="handleUpdate(scope.row)"
                               v-hasPermi="['merchant:news:edit']">修改
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
                <el-form-item label="订单编号" prop="orderSn">
                    <el-input v-model="form.orderSn" placeholder="订单编号" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="支付ID" prop="payId">
                    <el-input v-model="form.payId" placeholder="支付id" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="会员ID" prop="memberId">
                    <el-input v-model="form.memberId" placeholder="会员ID" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="用户账号" prop="memberUsername">
                    <el-input v-model="form.memberUsername" placeholder="用户账号" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="订单总金额" prop="totalAmount">
                    <el-input v-model="form.totalAmount" placeholder="订单总金额" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="采购价" prop="purchasePrice">
                    <el-input v-model="form.purchasePrice" placeholder="采购价" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="应付金额" prop="payAmount">
                    <el-input v-model="form.payAmount" placeholder="应付金额" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="运费金额" prop="freightAmount">
                    <el-input v-model="form.freightAmount" placeholder="运费金额" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="支付方式" prop="payType">
                    <el-select v-model="form.payType" placeholder="支付方式" clearable style="width: 280px" :disabled="form.id">
                        <el-option
                                label="未支付"
                                value="0"
                        />
                        <el-option
                                label="支付宝"
                                value="1"
                        />
                        <el-option
                                label="微信"
                                value="2"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="订单状态" prop="status">
                    <el-select v-model="form.status" placeholder="订单状态" clearable style="width: 280px">
                        <el-option
                                label="待付款"
                                value="0"
                        />
                        <el-option
                                label="待发货"
                                value="1"
                        />
                        <el-option
                                label="已发货"
                                value="2"
                        />
                        <el-option
                                label="已完成"
                                value="3"
                        />
                        <el-option
                                label="已关闭"
                                value="4"
                        />
                        <el-option
                                label="无效订单"
                                value="5"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="退款状态" prop="aftersaleStatus">
                    <el-select v-model="form.aftersaleStatus" placeholder="退款状态" clearable style="width: 280px" :disabled="form.id">
                        <el-option
                                label="无售后或售后关闭"
                                value="1"
                        />
                        <el-option
                                label="售后处理中"
                                value="2"
                        />
                        <el-option
                                label="退款中"
                                value="3"
                        />
                        <el-option
                                label="退款成功"
                                value="4"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="物流公司" prop="deliveryCompany">
                    <el-input v-model="form.deliveryCompany" placeholder="物流公司" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="物流单号" prop="deliverySn">
                    <el-input v-model="form.deliverySn" placeholder="物流单号" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="收货人姓名" prop="receiverName">
                    <el-input v-model="form.receiverName" placeholder="收货人姓名" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="收货人电话" prop="receiverPhone">
                    <el-input v-model="form.receiverPhone" placeholder="收货人电话" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="收货人邮编" prop="receiverPostCode">
                    <el-input v-model="form.receiverPostCode" placeholder="收货人邮编" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="详细地址" prop="receiverDetailAddress">
                    <el-input v-model="form.receiverDetailAddress" placeholder="详细地址" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="订单备注" prop="note">
                    <el-input v-model="form.note" placeholder="订单备注" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="商家备注" prop="merchantNote">
                    <el-input v-model="form.merchantNote" placeholder="商家备注" style="width: 280px;" :disabled="form.id"/>
                </el-form-item>
                <el-form-item label="确认收货状态" prop="confirmStatus">
                    <el-select v-model="form.confirmStatus" placeholder="确认收货状态" clearable style="width: 280px" :disabled="form.id">
                        <el-option
                                label="未确认"
                                value="0"
                        />
                        <el-option
                                label="已确认"
                                value="1"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="支付时间" prop="paymentTime" :disabled="form.id">
                    <el-date-picker
                            disabled
                            v-model="form.paymentTime"
                            type="datetime"
                            placeholder="支付时间"
                            style="width: 200px"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="发货时间" prop="deliveryTime">
                    <el-date-picker
                            disabled
                            v-model="form.deliveryTime"
                            type="datetime"
                            placeholder="发货时间"
                            style="width: 200px"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="确认收货时间" prop="receiveTime">
                    <el-date-picker
                            disabled
                            v-model="form.receiveTime"
                            type="datetime"
                            placeholder="确认收货时间"
                            style="width: 200px"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    >
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定
                    </el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Notice">
    import {addOrder, delOrder, getOrder, listOrder, updateOrder} from "@/api/order/index";

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
    const listOrderAllData = ref([]);

    const data = reactive({
        form: {},
        queryParams: {
            pageNo: 1,
            pageSize: 10
        },
        rules: {

        },
    });

    const {queryParams, form, rules} = toRefs(data);

    function onRadioChange() {
        form.value.payAmount = ''
    }


    /** 查询广告列表 */
    function getList() {
        loading.value = true;
        listOrder(queryParams.value).then(response => {
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
        getOrder(id).then(response => {
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
                    OrderType: '2'
                }
                if (form.value.id) {
                    updateOrder(form.value).then(response => {
                        proxy.$modal.msgSuccess("修改成功");
                        open.value = false;
                        getList();
                    });
                } else {
                    addOrder(form.value).then(response => {
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
        const id = row.OrderId || ids.value
        proxy.$modal.confirm('是否确认删除？').then(function () {
            return delOrder(id);
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
            return changeOrderStatus(row.OrderId);
        }).then(() => {
            proxy.$modal.msgSuccess(text + "成功");
        }).catch(function () {
            row.status = row.status === "0" ? "1" : "0";
        });
    }

    getList();
</script>
