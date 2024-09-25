<template>
    <div class="app-container">
        <h1>商户订单统计</h1>
        <el-row :model="form">
            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '34px',color: 'red'}">{{form.statisticUp10.orderCount}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '24px'}">会员订单总数</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '34px',color: 'red'}">{{form.statisticUp10.paidOrder}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '24px'}">已支付订单</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '34px',color: 'red'}">{{form.statisticUp10.unpaidOrder}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '24px'}">待支付订单</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '34px',color: 'red'}">{{form.statisticUp10.refundOrder}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '24px'}">已退款订单</p>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :model="form">
            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '30px',color: 'red'}">{{form.statisticLow10.todayPaid}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '20px'}">今日已支付订单</p>
                        <p :style="{fontWeight: 'bold',fontSize: '18px', color: 'red'}" v-if="form.statisticLow10.todayCompare >= 0">
                            <el-icon><TopRight /></el-icon>
                            较昨日增长{{form.statisticLow10.todayCompare}}笔
                        </p>
                        <p :style="{fontWeight: 'bold',fontSize: '18px', color: 'green'}" v-if="form.statisticLow10.todayCompare < 0">
                            <el-icon><BottomRight /></el-icon>
                            较昨日降低{{form.statisticLow10.todayCompare}}笔
                        </p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '30px',color: 'red'}">{{form.statisticLow10.monthPaid}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '20px'}">本月已支付订单</p>
                        <p :style="{fontWeight: 'bold',fontSize: '18px', color: 'red'}" v-if="form.statisticLow10.monthCompare >= 0">
                            <el-icon><TopRight /></el-icon>
                            较上月增长{{form.statisticLow10.monthCompare}}笔
                        </p>
                        <p :style="{fontWeight: 'bold',fontSize: '18px', color: 'green'}" v-if="form.statisticLow10.monthCompare < 0">
                            <el-icon><BottomRight /></el-icon>
                            较上月降低{{form.statisticLow10.monthCompare}}笔
                        </p>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <h1>用户订单统计</h1>
        <el-row :model="form">
            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '34px',color: 'red'}">{{form.statisticUp20.orderCount}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '24px'}">报名订单总数</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '34px',color: 'red'}">{{form.statisticUp20.paidOrder}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '24px'}">已支付订单</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '34px',color: 'red'}">{{form.statisticUp20.unpaidOrder}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '24px'}">待支付订单</p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '34px',color: 'red'}">{{form.statisticUp20.refundOrder}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '24px'}">已退款订单</p>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :model="form">
            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '30px',color: 'red'}">{{form.statisticLow20.todayPaid}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '20px'}">今日已支付订单</p>
                        <p :style="{fontWeight: 'bold',fontSize: '18px', color: 'red'}" v-if="form.statisticLow20.todayCompare >= 0">
                            <el-icon><TopRight /></el-icon>
                            较昨日增长{{form.statisticLow20.todayCompare}}笔
                        </p>
                        <p :style="{fontWeight: 'bold',fontSize: '18px', color: 'green'}" v-if="form.statisticLow20.todayCompare < 0">
                            <el-icon><BottomRight /></el-icon>
                            较昨日降低{{form.statisticLow20.todayCompare}}笔
                        </p>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6" class="card-box">
                <el-card>
                    <div style="height: 150px;text-align: center;vertical-align: middle;">
                        <p :style="{fontWeight: 'bold',fontSize: '30px',color: 'red'}">{{form.statisticLow20.monthPaid}}</p>
                        <p :style="{fontWeight: 'bold',fontSize: '20px'}">本月已支付订单</p>
                        <p :style="{fontWeight: 'bold',fontSize: '18px', color: 'red'}" v-if="form.statisticLow20.monthCompare >= 0">
                            <el-icon><TopRight /></el-icon>
                            较上月增长{{form.statisticLow20.monthCompare}}笔
                        </p>
                        <p :style="{fontWeight: 'bold',fontSize: '18px', color: 'green'}" v-if="form.statisticLow20.monthCompare < 0">
                            <el-icon><BottomRight /></el-icon>
                            较上月降低{{form.statisticLow20.monthCompare}}笔
                        </p>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup name="WorkBeach">

    import {statisticUp, statisticLow} from "@/api/order/index";
    const {proxy} = getCurrentInstance();
    const form = ref({
        statisticUp10:{},
        statisticUp20:{},
        statisticLow10:{},
        statisticLow20:{}
    });

    function getInfo() {
        statisticUp({orderType: '10'}).then(response => {
            form.value.statisticUp10 = response.data;
        });
        statisticUp({orderType: '20'}).then(response => {
            form.value.statisticUp20 = response.data;
        });
        statisticLow({orderType: '10'}).then(response => {
            form.value.statisticLow10 = response.data;
        });
        statisticLow({orderType: '20'}).then(response => {
            form.value.statisticLow20 = response.data;
        });
    }

    getInfo();
</script>
