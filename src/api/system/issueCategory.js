import request from '@/utils/request'

// 查询问题分类列表
export function listCategory(query) {
    return request({
        url: '/system/issue/category/list',
        method: 'get',
        params: query
    })
}


// 查询问题分类详细
export function getCategory(categoryId) {
    return request({
        url: '/system/issue/category/' + categoryId,
        method: 'get'
    })
}

// 新增问题分类
export function addCategory(data) {
    return request({
        url: '/system/issue/category',
        method: 'post',
        data: data
    })
}

// 修改问题分类
export function updateCategory(data) {
    return request({
        url: '/system/issue/category',
        method: 'put',
        data: data
    })
}

// 删除问题分类
export function delCategory(categoryId) {
    return request({
        url: '/system/issue/category/' + categoryId,
        method: 'delete'
    })
}