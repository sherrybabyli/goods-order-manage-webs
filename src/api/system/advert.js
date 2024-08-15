import request from '@/utils/request'

// 查询广告banner列表
export function listAdvert(query) {
    return request({
        url: '/system/advert/list',
        method: 'get',
        params: query
    })
}

// 查询广告banner详细
export function getAdvert(advertId) {
    return request({
        url: '/system/advert/' + advertId,
        method: 'get'
    })
}

// 新增广告banner
export function addAdvert(data) {
    return request({
        url: '/system/advert',
        method: 'post',
        data: data
    })
}

// 修改广告banner
export function updateAdvert(data) {
    return request({
        url: '/system/advert',
        method: 'put',
        data: data
    })
}

// 删除广告banner
export function delAdvert(advertId) {
    return request({
        url: '/system/advert/' + advertId,
        method: 'delete'
    })
}

// 广告状态修改
export function changeAdvertStatus(advertId, status) {
    const data = {
        advertId,
        status
    }
    return request({
        url: '/system/advert/changeStatus',
        method: 'put',
        data: data
    })
}
