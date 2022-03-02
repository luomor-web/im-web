<template>
  <v-expand-transition>
    <v-card v-drag class="video-content" v-show="display">
      <v-app-bar dense class="px-3" elevation="0">
        <v-avatar color="#b7c1ca" size="30">
          <img
              :src="callUser.avatar"
          >
        </v-avatar>
        <v-toolbar-title class="ml-1">{{callUser.username}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="changeAudio" v-if="videoed || role === 'HOST'">
          <v-icon>{{ audioEnabled ? icons.mdiMicrophone : icons.mdiMicrophoneOff }}</v-icon>
        </v-btn>
        <v-btn icon @click="changeVideo" v-if="videoed || role === 'HOST'">
          <v-icon>{{ videoEnabled ? icons.mdiCamera : icons.mdiCameraOff }}</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="refuse" elevation="0">
          <v-icon>{{ icons.mdiPhoneHangup }}</v-icon>
        </v-btn>
        <v-btn icon color="green" @click="agree" elevation="0" v-if="!videoed && role === 'PARTNER'">
          <v-icon>{{ icons.mdiVideo }}</v-icon>
        </v-btn>
      </v-app-bar>

      <div class="content-center" v-if="session">
        <user-video
            :stream-manager="subStreamManager"
            :class=" {'other-video': isMainStream}"
            @click.native="updateMainVideoStreamManager(subStreamManager)"/>
        <user-video
            :stream-manager="mainStreamManager"
            :class=" {'other-video':!isMainStream }"
            @click.native="updateMainVideoStreamManager(subStreamManager)"/>
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
import {currentUserId, loadedRooms} from "@/views/home/home";
import msg from "@/plugins/msg";
import {callVideo} from "@/net/message";
import {mdiCamera, mdiCameraOff, mdiMicrophone, mdiMicrophoneOff, mdiPhoneHangup, mdiVideo} from "@mdi/js";
import UserVideo from "@/components/system/UserVideo";
import {OpenVidu} from "openvidu-browser";
import {createSession, createToken} from "@/net/api";

export default {
  name: "ImVideoDialog",
  components: {UserVideo},
  props: {
    room: {type: Object}
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

    // 推送者视频流
    const publisher = ref(undefined)
    const OV = ref(undefined)
    const session = ref(undefined)
    // 主界面视频流
    const mainStreamManager = ref(undefined)
    // 接听者视频流
    const subStreamManager = ref(undefined)
    // 所有的子, 本界面不存在
    const subscribers = ref([])
    // 开启音频
    const audioEnabled = ref(true)
    // 开启视频
    const videoEnabled = ref(true)
    // 放大的视频是不是自己
    const isMainStream = ref(true)

    // 当前
    const role = ref('')
    // 提示框
    const snackbar = ref({
      display: false,
      text: ''
    })
    // 是否显示弹窗
    const display = ref(false)
    // 是否正在视频中
    const videoed = ref(false)
    // 呼叫配置
    const calledConfig = ref(null)
    // 定时器
    const selfTimer = ref(null)
    // 呼叫/被呼叫 用户
    const callUser = ref({})

    // 接听或挂断视频
    const refuse = () => {
      const param = {
        ...calledConfig.value,
        command: role.value === 'HOST' ? 'CALLED_REFUSE' : 'BE_CALLED_REFUSE'
      }
      callVideo(param)
      overVideo('通话结束')
    }

    const agree = () => {
      const param = {
        ...calledConfig.value,
        command: 'AGREE'
      }
      callVideo(param)
      videoed.value = true
      joinSession()
      clearTimeout(selfTimer.value)
    }

    const call = () => {
      display.value = true
      role.value = 'HOST'
      if (props.room.isFriend) {
        const find = props.room.users.find(x => x._id !== currentUserId.value);
        callUser.value = find
        calledConfig.value = {userId: find._id, fromId: currentUserId.value, roomId: props.room.roomId, command: 'CALL'}
        callVideo(calledConfig.value)
      }
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

              publisher.value.on('streamAudioVolumeChange', (event) => {
                console.log('Publisher audio volume change from ' + event.value.oldValue + ' to' + event.value.newValue);
              });

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
          // 接听者指令
        case 'CALL': {
          display.value = true
          role.value = 'PARTNER'
          calledConfig.value = data.data;
          const room = loadedRooms.value.find(x => x.roomId === calledConfig.value.roomId);
          callUser.value = room.users.find(x => x._id === calledConfig.value.fromId)
          selfTimer.value = setTimeout(() => {
            overVideo('已超时')
          }, 20000)
          break;
        }
        case 'AGREE':
          clearTimeout(selfTimer.value)
          snackbar.value.display = true
          snackbar.value.text = '已接通'
          break;
        case 'BE_CALLED_REFUSE':
          overVideo('接听者对方已挂断')
          break;

          // 发起者接收指令
        case 'NOT_ONLINE':
          snackbar.value.display = true
          snackbar.value.text = '对方不在线'
          setTimeout(() => {
            display.value = false
          }, 1000)
          break;
        case 'REQ_SUCCESS':
          selfTimer.value = setTimeout(() => {
            overVideo('对方无响应')
          }, 20000)
          joinSession()
          break;
        case 'CALLED_REFUSE':
          overVideo('发起者已挂断')
          break;
        default:
          break;
      }
    }

    const updateMainVideoStreamManager = () => {
      isMainStream.value = !isMainStream.value
    }

    const overVideo = (text) => {
      console.log(videoed.value, text)
      snackbar.value.display = true
      snackbar.value.text = text
      setTimeout(() => {
        display.value = false
      }, 1000)
      leaveSession()
      emit('close')
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
      videoed.value = false
      role.value = ''
      clearTimeout(selfTimer)

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
      callUser,

      updateMainVideoStreamManager,
      refuse,
      agree,
      call,
      overVideo,
      changeAudio,
      changeVideo,

      icons: {
        mdiPhoneHangup,
        mdiMicrophone,
        mdiMicrophoneOff,
        mdiCamera,
        mdiCameraOff,
        mdiVideo
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

  }

}


</style>
