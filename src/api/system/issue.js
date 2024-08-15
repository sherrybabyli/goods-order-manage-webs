import request from '@/utils/request'

// 查询问题列表
export function listIssue(query) {
    return request({
        url: '/argument/issue/list',
        method: 'get',
        params: query
    })
}

// 查询所有问题分类列表
export function getCategorys(query) {
    return request({
        url: '/system/issue/category/listAll',
        method: 'get',
        params: query
    })
}


// 查询问题详细
export function getIssue(issueId) {
    return request({
        url: '/argument/issue/' + issueId,
        method: 'get'
    })
}

// 新增问题
export function addIssue(data) {
    return request({
        url: '/argument/issue',
        method: 'post',
        data: data
    })
}

// 修改问题
export function updateIssue(data) {
    return request({
        url: '/argument/issue',
        method: 'put',
        data: data
    })
}

// 删除问题
export function delIssue(issueId) {
    return request({
        url: '/argument/issue/' + issueId,
        method: 'delete'
    })
}