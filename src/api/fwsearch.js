import request from '@/utils/request'

export function listFirmware(query) {
  return request({
    url: '/firmware/list',
    method: 'get',
    params: query
  })
}

export function markStatus(data) {
  return request({
    url: '/firmware/update',
    method: 'post',
    data
  })
}

export function deleteCategory(data) {
  return request({
    url: '/category/delete',
    method: 'post',
    data
  })
}
