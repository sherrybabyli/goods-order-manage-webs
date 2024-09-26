import request from '@/utils/request'

// 查询OSS对象存储列表
export function listOss(query) {
  return request({
    url: '/resource/oss/list',
    method: 'get',
    params: query
  })
}

// 查询OSS对象基于id串
export function listByIds(ossId) {
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

// 删除OSS对象存储
export function delOss(ossId) {
  return request({
    url: '/resource/oss/' + ossId,
    method: 'delete'
  })
}

