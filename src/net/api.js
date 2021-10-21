import request from "@/utils/request";

export const mergeFile = (data) => {
  console.log(data,'data')
  return request({
    url: '/api/file/upload/merge/file',
    method: 'post',
    params: data
  })
}
