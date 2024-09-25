import request from '@/utils/request'

export function statisticUp(data) {
  return request({
    url: '/system/orderStatistics/statisticUp',
    method: 'post',
    data: data
  })
}

export function statisticLow(data) {
  return request({
    url: '/system/orderStatistics/statisticLow',
    method: 'post',
    data: data
  })
}

export function pageMerchantList(query) {
  return request({
      url: '/system/orderManage/pageMerchantList',
      method: 'get',
      params: query
  })
}

export function pageUserList(query) {
  return request({
      url: '/system/orderManage/pageUserList',
      method: 'get',
      params: query
  })
}