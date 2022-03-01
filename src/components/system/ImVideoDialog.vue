<template>
  <v-expand-transition>
    <v-card v-drag class="video-content" v-show="display">
      <v-app-bar dense class="px-3" elevation="0">
        <v-toolbar-title>Title</v-toolbar-title>
        <v-spacer></v-spacer>
        <!--        <v-btn icon>-->
        <!--          <v-icon>mdi-fullscreen</v-icon>-->
        <!--        </v-btn>-->
        <v-btn icon @click="close">
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </v-app-bar>

      <div class="content-center" v-if="session">
        <user-video :stream-manager="subStreamManager" :class="isMainStream ? 'other-video': ''"
                    @click.native="updateMainVideoStreamManager(subStreamManager)"/>
        <user-video :stream-manager="mainStreamManager" :class="!isMainStream ? 'other-video': ''" @click.native="updateMainVideoStreamManager(subStreamManager)"/>

        <div class="px-16 align-center tool-bar justify-space-between">
          <v-btn small fab dark color="grey" elevation="0" @click="changeAudio">
            <v-icon dark>{{ audioEnabled ? icons.mdiMicrophone : icons.mdiMicrophoneOff }}</v-icon>
          </v-btn>
          <v-btn fab dark color="red" @click="stop" elevation="0">
            <v-icon dark>{{ icons.mdiPhoneOff }}</v-icon>
          </v-btn>
          <v-btn small fab dark color="grey" elevation="0" @click="changeVideo">
            <v-icon dark>{{ videoEnabled ? icons.mdiCamera : icons.mdiCameraOff }}</v-icon>
          </v-btn>
        </div>
      </div>

      <v-snackbar
          v-model="snackbar.display"
          :timeout="1000"
      >
        {{ snackbar.text }}

        <template v-slot:action="{ attrs }">
          <v-btn
              color="pink"
              text
              v-bind="attrs"
              @click="snackbar.display = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-expand-transition>
</template>

<script>

import {onMounted, ref} from "@vue/composition-api";
import {currentUserId} from "@/views/home/home";
import msg from "@/plugins/msg";
import {callVideo} from "@/net/message";
import {mdiCamera, mdiCameraOff, mdiMicrophone, mdiMicrophoneOff, mdiPhone, mdiPhoneOff} from "@mdi/js";
import UserVideo from "@/components/system/UserVideo";
import {OpenVidu} from "openvidu-browser";
// import {createSession, createToken} from "@/net/api";
import {createSession, createToken} from "@/net/api";

export default {
  name: "ImVideoDialog",
  components: {UserVideo},
  props: {
    room: {type: Object}
    // callUserId: {type: String},
  },
  // 自定义指令 实现可拖动
  directives: {
    drag(el) {
      el.onmousedown = function (e) {

        const disX = e.pageX - el.offsetLeft;
        const disY = e.pageY - el.offsetTop;

        console.log(disX, disY, e.pageX, e.pageY)
        document.onmousemove = function (e) {
          el.style.left = e.pageX - disX + 'px'
          el.style.top = e.pageY - disY + 'px'
        }
        document.onmouseup = function () {
          document.onmousemove = document.onmouseup = null
        }
      }
    }
  },
  comments: {},

  setup(props, {emit}) {

    const publisher = ref(undefined)
    const OV = ref(undefined)
    const session = ref(undefined)
    const mainStreamManager = ref(undefined)
    const subStreamManager = ref(undefined)
    const subscribers = ref([])
    const audioEnabled = ref(true)
    const videoEnabled = ref(true)
    const isMainStream = ref(true)


    const role = ref('')
    const snackbar = ref({
      display: false,
      text: ''
    })
    const display = ref(false)
    const videoed = ref(false)
    const calledConfig = ref(null)
    const selfTimer = ref(null)


    // 接听或挂断视频
    const stop = () => {
      const param = {
        ...calledConfig.value,
        command: 'REFUSE'
      }
      callVideo(param)
    }

    const start = async () => {
      const param = {
        ...calledConfig.value,
        command: 'AGREE'
      }
      callVideo(param)
      console.log('start')
      videoed.value = true
      clearTimeout(selfTimer.value)
    }

    const call = () => {
      display.value = true
      role.value = 'HOST'
      if (props.room.isFriend) {
        const find = props.room.users.find(x => x._id !== currentUserId.value);
        console.log(find, 'find')
        calledConfig.value = {userId: find._id, fromId: currentUserId.value, roomId: props.room.roomId, command: 'CALL'}
        // callVideo(calledConfig.value)
      }
      joinSession()
    }

    const joinSession = () => {

      OV.value = new OpenVidu();

      session.value = OV.value.initSession();

      // On every new Stream received...
      session.value.on('streamCreated', ({stream}) => {
        console.log(subscribers, 'subscribers')
        const subscriber = session.value.subscribe(stream);
        console.log(subscriber)
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

      getToken(props.room.roomId).then(token => {
        console.log(token, 'token', session.value)
        session.value.connect(token, {clientData: currentUserId.value})
            .then(() => {
              // --- Get your own camera stream with the desired properties ---

              let publisherCamera = OV.value.initPublisher(undefined, {
                audioSource: undefined, // The source of audio. If undefined default microphone
                videoSource: undefined, // The source of video. If undefined default webcam
                publishAudio: true,  	// Whether you want to start publishing with your audio unmuted or not
                publishVideo: true,  	// Whether you want to start publishing with your video enabled or not
                resolution: '640x480',  // The resolution of your video
                frameRate: 30,			// The frame rate of your video
                insertMode: 'APPEND',	// How the video is inserted in the target element 'video-container'
                mirror: false,      	// Whether to mirror your local video or not
              });

              console.log(publisherCamera, 'selfPublish')
              mainStreamManager.value = publisherCamera;
              publisher.value = publisherCamera;

              // --- Publish your stream ---

              session.value.publish(publisher.value);
            })
            .catch(error => {
              console.log('There was an error connecting to the session:', error.code, error.message);
            });
      });

      window.addEventListener('beforeunload', leaveSession)

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

    const changeAudio = () => {
      audioEnabled.value = !audioEnabled.value
      console.log(publisher.value, 'publih')
      publisher.value.publishAudio(audioEnabled.value)
    }

    const changeVideo = () => {
      videoEnabled.value = !videoEnabled.value
      publisher.value.publishVideo(videoEnabled.value)
    }

    onMounted(() => {
      msg.$on('COMMAND_VIDEO_RESP', COMMAND_VIDEO_RESP)
    })

    const COMMAND_VIDEO_RESP = async (data) => {
      console.log(data)
      switch (data.data.command) {
        case 'NOT_ONLINE':
          snackbar.value.display = true
          snackbar.value.text = '对方不在线'
          setTimeout(() => {
            display.value = false
          }, 1000)
          break;
        case 'REQ_SUCCESS':
          selfTimer.value = setTimeout(() => {
            console.log('对方无响应')
            overVideo('对方无响应')
          }, 20000)
          break;
        case 'CALL':
          display.value = true
          role.value = 'PARTNER'
          calledConfig.value = data.data
          selfTimer.value = setTimeout(() => {
            console.log('自己无响应')
            overVideo('已超时')
          }, 20000)
          break;
        case 'AGREE':
          clearTimeout(selfTimer.value)
          snackbar.value.display = true
          snackbar.value.text = '等待流就绪'
          break;
        case 'STREAM_OK':
          snackbar.value.display = true
          snackbar.value.text = '流已就绪'
          break;
        case 'REFUSE':
          break;
        default:
          break;
      }
    }

    const updateMainVideoStreamManager = () => {
      // if (mainStreamManager.value === stream) return;
      // mainStreamManager.value = stream;
      isMainStream.value = !isMainStream.value
      // subStreamManager.value = mainStreamManager.value
      // mainStreamManager.value = stream
    }

    const overVideo = (text) => {
      if (!videoed.value) {
        snackbar.value.display = true
        snackbar.value.text = text
        setTimeout(() => {
          display.value = false
        }, 1000)
      }
    }

    const close = () => {
      display.value = false
      emit('close')
      leaveSession()
    }

    const leaveSession = () => {
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

    return {
      isMainStream,
      display,
      snackbar,
      videoed,
      role,
      publisher,
      subscribers,
      mainStreamManager,
      session,
      subStreamManager,
      audioEnabled,
      videoEnabled,

      updateMainVideoStreamManager,
      stop,
      start,
      call,
      close,
      changeAudio,
      changeVideo,

      icons: {
        mdiPhoneOff,
        mdiPhone,
        mdiMicrophone,
        mdiMicrophoneOff,
        mdiCamera,
        mdiCameraOff
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.video-content {
  width: 400px;
  position: fixed;
  z-index: 30;
  top: 20px;
  left: calc(100vw - 520px);

  .content-center {
    height: 300px;
    position: relative;

    .other-video {
      width: 160px;
      height: 120px;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1
    }

    .tool-bar {
      display: none;
      height: 60px;
      width: 100%;
      position: absolute;
      bottom: 0;
      z-index: 1;
      animation: anim 0.5s;
    }


  }

  .content-center:hover {

    .tool-bar {
      animation: anim 0.5s;
      display: flex;
    }
  }
}

@keyframes anim {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

</style>
