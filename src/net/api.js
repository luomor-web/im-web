import request from '@/utils/request'

export function init(data) {
    return request({
        url: '/file/multipart/init',
        method: 'post',
        data
    })
}

export function upload(url, data, cb) {
    return request({
        url,
        method: 'put',
        retry: 3,
        timeout: 500000,
        retryDelay: 1000,
        onUploadProgress: (event) => {
            cb(event.loaded, event.total)
        },
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        data
    })
}

export function mergeMultipartUpload(data) {
    return request({
        url: '/file/multipart/complete',
        method: 'put',
        data
    })
}

export function registerUser(data) {
    return request({
        url: '/account/register',
        method: 'put',
        data
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
        data
    })
}

export function pullVideoStream(data, userId) {
    return request({
        url: '/webrtc/play?streamPath=live/' + userId,
        method: 'post',
        data
    })
}

export function createSession(sessionId) {
    return request({
        url: '/openvidu/api/sessions',
        method: 'post',
        data: {
            customSessionId: sessionId
        },
        auth: {
            username: 'OPENVIDUAPP',
            password: 'MY_SECRET'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function createToken(sessionId) {
    return request({
        url: `/openvidu/api/sessions/${sessionId}/connection`,
        method: 'post',
        data: {},
        auth: {
            username: 'OPENVIDUAPP',
            password: 'MY_SECRET'
        },
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    })
}

function downloadClient() {
    return request({
        method: 'get',
        url: process.env.VUE_APP_UPDATE_URL + 'latest.yml'
    })
}

export function userLogin(data) {
    return request({
        url: '/user/login',
        method: 'post',
        data
    })
}

export default {
    upload,
    downloadClient
}
