import request from '@/utils/request'


export function pageUserList(query) {
  return request({
      url: '/system/orderManage/pageUserList',
      method: 'get',
      params: query
  })
}