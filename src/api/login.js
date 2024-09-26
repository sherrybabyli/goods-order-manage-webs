import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid) {
    // 写死的登录用户信息
    const fixedUsername = 'admin';
    const fixedPassword = 'admin123';

    // 判断是否是写死的登录用户
    if (username === fixedUsername && password === fixedPassword) {

        // 模拟的登录响应
        const response = {
            code: 200, // HTTP状态码
            token: 'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImQzNmQ0OTI4LTEzM2ItNGU0Ni05Y2JiLTI0ZmRjYmNkZTVjYSIsImxvZ2luX3VzZXJfdXVpZCI6IjNfMDAifQ.vthGLssH8Spf8d5A21FlPY4gpXrgD0ogaXGAM6HK7BHFEfbbMjerPN8a0xVpHy22Yq4gsibz-5FgwqJJnIUTPw', // 返回的用户信息
            msg: '操作成功' // 登录成功的消息
        };

        // 返回一个Promise，模拟异步请求
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(response);
            }, 1); // 模拟网络延迟
        });
    } else {
        // 返回一个Promise，模拟登录失败
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject({
                    code: 500, // HTTP状态码
                    msg: '用户名或密码错误' // 登录失败的消息
                });
            }, 1); // 模拟网络延迟
        });
    }
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
    const response = {
        code: 200, // HTTP状态码
        permissions: [
            "*:*:*"
        ],
        roles:[
            "admin"
        ],
        user:{
            "remark": "管理员",
            "params": {
                "@type": "java.util.HashMap"
            },
            "userName": "管理员",
            "nickName": "管理员",
            "admin": true
        },
        msg: ''
    };

    // 返回一个Promise，模拟异步请求
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(response);
        }, 1); // 模拟网络延迟
    });
}

// 退出方法
export function logout() {
    const response = {
        code: 200, // HTTP状态码
        data: null,
        msg: ''
    };

    // 返回一个Promise，模拟异步请求
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(response);
        }, 1); // 模拟网络延迟
    });
}

// 获取验证码
export function getCodeImg() {
    const response = {
        code: 200, // HTTP状态码
        data: null,
        msg: ''
    };

    // 返回一个Promise，模拟异步请求
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(response);
        }, 1); // 模拟网络延迟
    });
}