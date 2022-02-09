<template>
  <div v-drag class="video-content">
<!--    <v-speed-dial top right>-->
<!--      <template v-slot:activator>-->
        <v-card>
          <video ref="video" width="200" height="200" autoplay muted></video>
          <video ref="video2" width="200" height="200" autoplay muted></video>
          <v-text-field v-model="pullId"></v-text-field>
          <v-btn @click="pullStream">拉</v-btn>
        </v-card>
<!--      </template>-->
<!--    </v-speed-dial>-->
  </div>
</template>

<script>

import {ref, watch} from "@vue/composition-api";
import {pullVideoStream, pushVideoStream} from "@/net/api";
import {currentUserId} from "@/views/home/home";

export default {
  name: "ImVideoDialog",
  props: {
    visible: {type: Boolean},
    // callUserId: {type: String},
  },
  // 自定义指令 实现可拖动
  directives: {
    drag(el) {
      el.onmousedown = function(e) {

        const disX = e.pageX - el.offsetLeft;
        const disY = e.pageY - el.offsetTop;

        console.log(disX,disY,e.pageX,e.pageY)
        document.onmousemove = function (e) {
          el.style.left = e.pageX - disX + 'px'
          el.style.top = e.pageY - disY + 'px'
        }
        document.onmouseup = function() {
          document.onmousemove = document.onmouseup = null
        }
      }
    }
  },

  setup(props, {emit}) {

    const video = ref(null)
    const video2 = ref(null)
    const localStream = ref(null)
    const remoteStream = ref(new MediaStream())
    const pullId = ref('1491059437373022208')
    const config = ref({iceServers: []});

    watch(() => props.visible, visible => {
      if (visible) {
        initLocalStream()
      }
    })

    // 初始化本地流
    const initLocalStream = async () => {
      if (localStream.value) return;

      localStream.value = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
      console.log(video)
      video.value.srcObject = localStream.value;
      await pushStream()
    }

    const pushStream = async () => {
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
      };

      localStream.value.getTracks().forEach(track => pc.addTrack(track, localStream.value))
      await pc.setLocalDescription(await pc.createOffer());
      const result = await pushVideoStream(pc.localDescription,currentUserId.value)
      // const result = await window.ajax({
      //   type: 'POST',
      //   processData: false,
      //   data: JSON.stringify(pc.localDescription),
      //   url: 'http://192.168.31.93:8081/api/webrtc/publish?streamPath=live/rtc',
      //   dataType: 'json'
      // });

      if (typeof result == 'string') {
        pc.close();
        return;
      }
      await pc.setRemoteDescription(new RTCSessionDescription(result));
    }

    const pullStream = async () => {
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
        remoteStream.value.addTrack(e.track, remoteStream.value);
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

     const result =  await pullVideoStream(pc.localDescription,pullId.value)

      if (typeof result == 'string') {
        pc.close();
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(result));
    }

    const close = () => {
      emit('close')
    }

    return {
      video,
      video2,
      pullId,

      initLocalStream,
      close,
      pullStream
    }
  }
}
</script>

<style lang="scss" scoped>
.video-content {
  width: 500px;
  height: 500px;
  position: fixed;
  z-index: 30;
  top: 20px;
  left: calc(100vw - 520px);
}
</style>
