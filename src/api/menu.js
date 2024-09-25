import request from '@/utils/request'

// 获取路由
export const getRouters = () => {
    const response = {
        code: 200, // HTTP状态码
        data:[
            {
                "name": "Goods",
                "path": "/goods",
                "hidden": false,
                "redirect": "noRedirect",
                "component": "Layout",
                "alwaysShow": true,
                "meta": {
                    "title": "商品管理",
                    "icon": "list",
                    "noCache": false,
                    "link": null
                },
                "children": [
                    {
                        "name": "list",
                        "path": "list",
                        "hidden": false,
                        "component": "goods/index",
                        "meta": {
                            "title": "商品列表",
                            "icon": "switch",
                            "noCache": false,
                            "link": null
                        }
                    }
                ]
            },

            {
                "name": "Order",
                "path": "/order",
                "hidden": false,
                "redirect": "noRedirect",
                "component": "Layout",
                "alwaysShow": true,
                "meta": {
                    "title": "订单管理",
                    "icon": "shopping",
                    "noCache": false,
                    "link": null
                },
                "children": [
                    {
                        "name": "index",
                        "path": "index",
                        "hidden": false,
                        "component": "order/index",
                        "meta": {
                            "title": "商品列表",
                            "icon": "job",
                            "noCache": false,
                            "link": null
                        }
                    }
                ]
            }
        ],
        msg: ''
    };

    // 返回一个Promise，模拟异步请求
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(response);
        }, 1000); // 模拟网络延迟
    });
}