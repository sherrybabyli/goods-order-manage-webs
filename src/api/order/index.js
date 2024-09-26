import request from '@/utils/request'

export function listOrder(query) {
    return request({
        url: '/spOrder/pageAdmin',
        method: 'get',
        params: query
    })
}

export function getOrder(id) {
    return request({
        url: '/spOrder/byId/?id=' + id,
        method: 'get'
    })
}

export function addOrder(data) {
    return request({
        url: '/spOrder/spAdd',
        method: 'post',
        data: data
    })
}

export function updateOrder(data) {
    return request({
        url: '/spOrder/update',
        method: 'post',
        data: data
    })
}

export function delOrder(id) {
    return request({
        url: '/Order/info/' + id,
        method: 'delete'
    })
}
