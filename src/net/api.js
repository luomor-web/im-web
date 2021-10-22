import request from "@/utils/request";

export function init(data) {
  return request({
    url: '/api/multipart/init',
    method: 'post',
    data: data
  })
}

export function upload(url, data) {
  return request({
    url: url,
    method: 'put',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    data: data
  })
}

export function mergeMultipartUpload(data) {
  return request({
    url: '/api/multipart/complete',
    method: 'put',
    data: data
  })
}
