import {ref} from "@vue/composition-api";
import {OpenVidu} from "openvidu-browser";
import {currentUserId} from "@/views/home/home";
import {createSession, createToken} from "@/net/api";

const OV = ref(undefined);
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

const joinSession = (roomId,sessionId,enableVideo) => {
    console.log(enableVideo,'enableVideo')

    OV.value = new OpenVidu();

    session.value = OV.value.initSession();

    // On every new Stream received...
    session.value.on('streamCreated', ({stream}) => {
        console.log(subscribers, 'subscribers')
        const subscriber = session.value.subscribe(stream);
        console.log(subscriber,'=========================================================================================================')
        console.log(stream)
        subscribers.value.push(subscriber);
        subStreamManager.value = subscriber
    });

    // On every Stream destroyed...
    session.value.on('streamDestroyed', ({stream}) => {
        const index = subscribers.value.indexOf(stream.streamManager, 0);
        if (index >= 0) {
            subscribers.value.splice(index, 1);
        }
    });

    // On every asynchronous exception...
    session.value.on('exception', ({exception}) => {
        console.warn(exception);
    });

    getToken(roomId).then(token => {
        console.log(token, 'token', session.value)
        session.value.connect(token, {clientData: currentUserId.value})
            .then(() => {
                // --- Get your own camera stream with the desired properties ---

                let publisherCamera = OV.value.initPublisher(undefined, {
                    audioSource: undefined, // The source of audio. If undefined default microphone
                    videoSource: undefined, // The source of video. If undefined default webcam
                    publishAudio: true,  	// Whether you want to start publishing with your audio unmuted or not
                    publishVideo: enableVideo,  	// Whether you want to start publishing with your video enabled or not
                    resolution: '640x480',  // The resolution of your video
                    frameRate: 30,			// The frame rate of your video
                    insertMode: 'APPEND',	// How the video is inserted in the target element 'video-container'
                    mirror: false,      	// Whether to mirror your local video or not
                });

                console.log(publisherCamera, 'selfPublish')
                mainStreamManager.value = publisherCamera;
                publisher.value = publisherCamera;

                publisher.value.on('streamAudioVolumeChange', (event) => {
                    // console.log(100 - (event.value.newValue * -1))
                    audioVolume.value = 100 - (event.value.newValue * -1)
                    // console.log('Publisher audio volume change from ' + event.value.oldValue + ' to' + event.value.newValue);
                });

                // --- Publish your stream ---

                session.value.publish(publisher.value);
            })
            .catch(error => {
                console.log('There was an error connecting to the session:', error.code, error.message);
            });
    });
}

const getToken = (sessionId) => {

    return new Promise((resolve, reject) => {
        getSession(sessionId).then(session => {
            console.log(session, 'session')
            createToken(session).then(response => {
                console.log(response, 'response')
                const {token} = response
                resolve(token)
            }).catch(error => {
                reject(error.response)
            })
        })
    })

}

const getSession = (sessionId) => {
    return createSession(sessionId).then(response => {
        const {sessionId: session} = response
        return session;
    }).catch(error => {
        if (error.response.status === 409) {
            return sessionId
        } else {
            return error.response
        }
    });
}

export const leaveSession = () => {
    // --- Leave the session by calling 'disconnect' method over the Session object ---
    if (session.value) session.value.disconnect();

    session.value = undefined;
    mainStreamManager.value = undefined;
    subStreamManager.value = undefined;
    publisher.value = undefined;
    subscribers.value = [];
    OV.value = undefined;

    window.removeEventListener('beforeunload', leaveSession);
}

 const changeAudio = (flag) => {
    publisher.value.publishAudio(flag)
}

 const changeVideo = (flag) => {
    publisher.value.publishVideo(flag)
}

export const du = {
    changeVideo,
    changeAudio,
    joinSession,
    leaveSession
}
