<template>
  <!--    <v-speed-dial top right>-->
  <!--      <template v-slot:activator>-->
  <v-expand-transition>
    <v-card v-drag class="video-content" v-show="display">
      <v-app-bar dense class="px-3" elevation="0">

        <v-toolbar-title>Title</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>

        <v-btn icon @click="close">
          <v-icon>mdi-window-close</v-icon>
        </v-btn>

      </v-app-bar>
      <div style="height: 300px;position: relative">
        <div>
          <video style="object-fit:fill" ref="video" width="400" height="300" autoplay muted></video>
        </div>
        <div style="width: 160px;height: 120px;position: absolute;right: 0;bottom: 0;z-index: 1">
          <video style="object-fit:fill" ref="video2" width="160" height="120" autoplay muted></video>
        </div>
      </div>
      <v-toolbar class="px-16" v-if="role === 'HOST' || videoed" elevation="0">
        <v-btn  small fab dark color="grey" elevation="0">
          <v-icon dark>mdi-microphone</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn fab dark color="red" @click="stop" elevation="0">
          <v-icon dark>{{ icons.mdiPhoneOff }}</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn small fab dark color="grey" elevation="0">
          <v-icon dark>mdi-camera</v-icon>
        </v-btn>
      </v-toolbar>

      <v-toolbar class="px-16" v-if="role === 'PARTNER' && !videoed" elevation="0">
        <v-btn fab dark color="red" @click="stop">
          <v-icon dark>{{ icons.mdiPhoneOff }}</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn fab dark color="green" @click="start">
          <v-icon dark>{{ icons.mdiPhone }}</v-icon>
        </v-btn>
      </v-toolbar>

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
  <!--      </template>-->
  <!--    </v-speed-dial>-->
</template>

<script>

import {onMounted, ref} from "@vue/composition-api";
import {pullVideoStream, pushVideoStream} from "@/net/api";
import {currentUserId} from "@/views/home/home";
import msg from "@/plugins/msg";
import {callVideo} from "@/net/message";
import {mdiPhone, mdiPhoneOff} from "@mdi/js";

export default {
  name: "ImVideoDialog",
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

  setup(props, {emit}) {

    const video = ref(null)
    const video2 = ref(null)
    const role = ref('')
    const localStream = ref(null)
    const remoteStream = ref(new MediaStream())
    const config = ref({iceServers: []});
    const snackbar = ref({
      display: false,
      text: ''
    })
    const display = ref(false)
    const videoed = ref(false)
    const calledConfig = ref(null)
    const selfTimer = ref(null)

    let localPc = null

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
      await initLocalStream()
      await pullStream(calledConfig.value.fromId)
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
        callVideo(calledConfig.value)
      }
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
          await initLocalStream()
          selfTimer.value = setTimeout(() => {
            console.log('对方无响应')
            overVideo('对方无响应')
            stopPushStream()
          }, 20000)
          break;
        case 'CALL':
          display.value = true
          role.value = 'PARTNER'
          calledConfig.value = data.data
          selfTimer.value = setTimeout(() => {
            console.log('自己无响应')
            overVideo('已超时')
            stopPushStream()
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
          await pullStream(calledConfig.value.userId)
          break;
        case 'REFUSE':
          stopPushStream()
          break;
        default:
          break;
      }
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

    const stopPushStream = () => {
      localPc.close()
      localPc = new RTCPeerConnection(config.value);
      localStream.value.getTracks().forEach(x => {
        x.stop()
      })
      localStream.value = null
      video.value.srcObject = null
    }

    // 初始化本地流
    const initLocalStream = async () => {
      console.log(localStream.value, 'localStream.value')
      if (localStream.value) return;
      console.log(localStream.value, 'localStream.value')
      localStream.value = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
      console.log(video, 'video')
      video.value.srcObject = localStream.value;
      await pushStream()
    }

    const pushStream = async () => {
      localPc = new RTCPeerConnection(config.value);
      localPc.onsignalingstatechange = e => {
        console.log(e);
      };
      localPc.oniceconnectionstatechange = e => {
        // this.iceConnectionState = pc.iceConnectionState;
        console.log(e)
      };
      localPc.onicecandidate = event => {
        console.log(event)
      };

      localStream.value.getTracks().forEach(track => localPc.addTrack(track, localStream.value))
      await localPc.setLocalDescription(await localPc.createOffer());
      const result = await pushVideoStream(localPc.localDescription, currentUserId.value)

      if (typeof result == 'string') {
        localPc.close();
        return;
      }
      await localPc.setRemoteDescription(new RTCSessionDescription(result));
      console.log(role.value, 'role.value')
      if (role.value === 'HOST') return
      const param = {
        ...calledConfig.value,
        command: 'STREAM_OK'
      }
      callVideo(param)
    }

    const pullStream = async (pullId) => {
      let pc = new RTCPeerConnection(config.value);
      pc.onsignalingstatechange = e => {
        console.log(e);
      };
      pc.oniceconnectionstatechange = e => {
        // this.iceConnectionState = pc.iceConnectionState;
        console.log(e)
      };
      pc.onicecandidate = event => {
        console.log(event)
      }
      pc.ontrack = e => {
        video2.value.srcObject = remoteStream.value
        remoteStream.value.addTrack(e.track);
      };

      const offerOptions = {
        // New spec states offerToReceiveAudio/Video are of type long (due to
        // having to tell how many "m" lines to generate).
        // http://w3c.github.io/webrtc-pc/#idl-def-RTCOfferAnswerOptions.
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true,
        voiceActivityDetection: true
      };
      await pc.setLocalDescription(await pc.createOffer(offerOptions));

      const result = await pullVideoStream(pc.localDescription, pullId)

      if (typeof result == 'string') {
        pc.close();
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(result));
    }

    const close = () => {
      display.value = false
      emit('close')
    }

    return {
      display,
      video,
      video2,
      snackbar,
      videoed,
      role,

      stop,
      start,
      call,
      initLocalStream,
      close,
      pullStream,

      icons: {
        mdiPhoneOff,
        mdiPhone,
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
}

video {
  transform: rotateY(180deg);
}
</style>
