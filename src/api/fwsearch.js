import request from '@/utils/request'

export function listFirmware(query) {
  return request({
    url: '/firmware/list',
    method: 'get',
    params: query
  })
}

export function listDetailFirmware(query) {
  return request({
    url: '/firmwares/list/detail',
    method: 'get',
    params: query
  })
}
export function markStatus(data) {
  return request({
    url: '/firmwares/' + data.fwId + '/' + data.status,
    method: 'post',
    data
  })
}

export function updateFirmware(data) {
  return request({
    url: '/firmwares/update',
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
