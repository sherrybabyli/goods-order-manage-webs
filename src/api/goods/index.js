import request from '@/utils/request'

export function listGoods(query) {
    return request({
        url: '/sp/spPage',
        method: 'get',
        params: query
    })
}

export function getGoods(id) {
    return request({
        url: '/sp/spById/?id=' + id,
        method: 'get'
    })
}

export function addGoods(data) {
    return request({
        url: '/sp/spAdd',
        method: 'post',
        data: data
    })
}

export function updateGoods(data) {
    return request({
        url: '/sp/spUpdate',
        method: 'post',
        data: data
    })
}

export function delGoods(id) {
    return request({
        url: '/Goods/info/' + id,
        method: 'delete'
    })
}

export function changeGoodsStatus(id,publishStatus) {
    const data = {
        id: id,
        publishStatus: publishStatus
    };
    return request({
        url: '/sp/spUpdate',
        method: 'post',
        data: data
    })
}

export function listGoodsAll(query) {
    return request({
        url: '/sp/spPage',
        method: 'get',
        params: query
    })
}