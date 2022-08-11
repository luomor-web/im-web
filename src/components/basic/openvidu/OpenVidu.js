import { computed, ref } from '@vue/composition-api'
import { OpenVidu } from 'openvidu-browser'
import { createSession, createToken } from '@/net/api'
import store from '@/store'

const OV = ref(undefined)
// 推送者视频流
const publisher = ref(undefined)
export const session = ref(undefined)
// 主界面视频流
export const mainStreamManager = ref(undefined)
// 接听者视频流
export const subStreamManager = ref(undefined)
// 所有的子, 本界面不存在
const subscribers = ref([])
export const audioVolume = ref(0)
const currentUserId = computed(() => store.state.currentUserId)

export const getDeviceList = () => {
  initOV()
  return new Promise(resolve => {
    OV.value.getDevices().then(devices => {
      resolve(devices)
    })
    // if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
    //   if (navigator.mediaDevices.getUserMedia) {
    //     // 最新标准API
    //     navigator.mediaDevices.enumerateDevices().then(devices => { resolve(devices) })
    //   } else if (navigator.webkitGetUserMedia) {
    //     // webkit内核浏览器
    //     navigator.webkitGetUserMedia.enumerateDevices().then(devices => { resolve(devices) })
    //   } else if (navigator.mozGetUserMedia) {
    //     // Firefox浏览器
    //     navigator.mozGetUserMedia.enumerateDevices().then(devices => { resolve(devices) })
    //   } else if (navigator.getUserMedia) {
    //     // 旧版API
    //     // Firefox浏览器
    //     navigator.getUserMedia.enumerateDevices().then(devices => { resolve(devices) })
    //   }
    // }
  })
}

export const getMediaPower = () => {
  initOV()
  return new Promise((resolve, reject) => {
    OV.value.getUserMedia({ publishVideo: true, publishAudio: true }).then(stream => {
       stream.getTracks().forEach(x => x.stop())
      resolve()
    })
    // const constrains = { audio: true, video: true }
    // if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
    //   if (navigator.mediaDevices.getUserMedia) {
    //     // 最新标准API
    //     navigator.mediaDevices.getUserMedia(constrains).then(stream => { stream.getTracks().forEach(x => x.stop()) }).catch(err => { reject(err) })
    //   } else if (navigator.webkitGetUserMedia) {
    //     // webkit内核浏览器
    //     navigator.webkitGetUserMedia(constrains).then(stream => { stream.getTracks().forEach(x => x.stop()) }).catch(err => { reject(err) })
    //   } else if (navigator.mozGetUserMedia) {
    //     // Firefox浏览器
    //     navigator.mozGetUserMedia(constrains).then(stream => { stream.getTracks().forEach(x => x.stop()) }).catch(err => { reject(err) })
    //   } else if (navigator.getUserMedia) {
    //     // 旧版API
    //     navigator.getUserMedia(constrains).then(stream => { stream.getTracks().forEach(x => x.stop()) }).catch(err => { reject(err) })
    //   }
    // }
  })
}

const joinSession = ({ roomId, sessionId, enableAudio = true, enableVideo = false, audioSource, videoSource }, errorCallBack) => {
    initOV()

    session.value = OV.value.initSession()

    // On every new Stream received...
    session.value.on('streamCreated', ({ stream }) => {
        const subscriber = session.value.subscribe(stream)
        subscribers.value.push(subscriber)
        subStreamManager.value = subscriber
    })

    // On every Stream destroyed...
    session.value.on('streamDestroyed', ({ stream }) => {
        const index = subscribers.value.indexOf(stream.streamManager, 0)
        if (index >= 0) {
            subscribers.value.splice(index, 1)
        }
    })

    // On every asynchronous exception...
    session.value.on('exception', ({ exception }) => {
      console.warn(exception)
    })

    getToken(roomId).then(token => {
        session.value.connect(token, { clientData: currentUserId.value })
            .then(() => {
                // --- Get your own camera stream with the desired properties ---
                const publisherCamera = OV.value.initPublisher(undefined, {
                    audioSource, // The source of audio. If undefined default microphone
                    videoSource, // The source of video. If undefined default webcam
                    publishAudio: enableAudio, // Whether you want to start publishing with your audio unmuted or not
                    publishVideo: enableVideo, // Whether you want to start publishing with your video enabled or not
                    resolution: '640x480', // The resolution of your video
                    frameRate: 30,			// The frame rate of your video
                    insertMode: 'APPEND',	// How the video is inserted in the target element 'video-container'
                    mirror: false // Whether to mirror your local video or not
                })
                mainStreamManager.value = publisherCamera
                publisher.value = publisherCamera

                publisher.value.on('streamAudioVolumeChange', (event) => {
                  audioVolume.value = 100 - (event.value.newValue * -1)
                })
                publisher.value.on('accessDenied', (event) => {
                  if (event.name === 'DEVICE_ALREADY_IN_USE') {
                    errorCallBack('设备被占用,无法展示当前')
                  }
                })

                // --- Publish your stream ---

                session.value.publish(publisher.value)
            }).catch(error => {
              console.error('There was an error connecting to the session:', error.code, error.message)
            })
    })
}

const getToken = (sessionId) => {
    return new Promise((resolve, reject) => {
        getSession(sessionId).then(session => {
            createToken(session).then(response => {
                const { token } = response
                resolve(token)
            }).catch(error => {
                reject(error.response)
            })
        })
    })
}

const getSession = (sessionId) => {
    return createSession(sessionId).then(response => {
        const { sessionId: session } = response
        return session
    }).catch(error => {
        if (error.response.status === 409) {
            return sessionId
        } else {
            return error.response
        }
    })
}

export const leaveSession = () => {
    // --- Leave the session by calling 'disconnect' method over the Session object ---
    if (session.value) {
      console.log('离开')
      session.value.disconnect()
    }

    session.value = undefined
    mainStreamManager.value = undefined
    subStreamManager.value = undefined
    publisher.value = undefined
    subscribers.value = []
    OV.value = undefined

    window.removeEventListener('beforeunload', leaveSession)
}

 const changeAudio = (flag) => {
    publisher.value.publishAudio(flag)
}

 const changeVideo = (flag) => {
    publisher.value.publishVideo(flag)
}

const initOV = () => {
  if (!OV.value) {
    OV.value = new OpenVidu()
  }
}

export const du = {
    changeVideo,
    changeAudio,
    joinSession,
    leaveSession
}
