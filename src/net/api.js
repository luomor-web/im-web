import request from "@/utils/request";

export function init(data) {
    return request({
        url: '/file/multipart/init',
        method: 'post',
        data: data
    })
}

export function upload(url, data, cb) {
    return request({
        url: url,
        method: 'put',
        onUploadProgress: (event) => {
            cb(event.loaded, event.total)
        },
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        data: data
    })
}

export function mergeMultipartUpload(data) {
    return request({
        url: '/file/multipart/complete',
        method: 'put',
        data: data
    })
}

export function registerUser(data) {
    return request({
        url: '/account/register',
        method: 'put',
        data: data
    })
}

export function checkAccountAuth(data) {
    return request({
        url: '/account/check',
        method: 'get',
        params: data
    })
}

export function pushVideoStream(data, userId) {
    return request({
        url: '/webrtc/publish?streamPath=live/' + userId,
        method: 'post',
        data: data
    })
}

export function pullVideoStream(data, userId) {
    return request({
        url: '/webrtc/play?streamPath=live/' + userId,
        method: 'post',
        data: data
    })
}


