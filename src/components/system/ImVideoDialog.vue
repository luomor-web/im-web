<template>
  <v-expand-transition>
    <v-card v-drag class="video-content" v-show="display">
      <v-app-bar dense class="px-3" elevation="0">
        <v-avatar color="#b7c1ca" size="30">
          <img
              :src="callUser.avatar"
          >
        </v-avatar>

        <v-toolbar-title class="ml-1">{{ callUser.username }}</v-toolbar-title>
        <v-progress-linear
            :active="!!session"
            :value="audioVolume"
            absolute
            bottom
            color="deep-purple accent-4"
        ></v-progress-linear>
        <v-spacer></v-spacer>
        <v-btn icon @click="changeAudio" v-if="videoed || role === 'HOST'">
          <v-icon>{{ audioEnabled ? icons.mdiMicrophone : icons.mdiMicrophoneOff }}</v-icon>
        </v-btn>
        <v-btn icon @click="changeVideo" v-if="(videoed || role === 'HOST') && calledConfig.type === 'VIDEO'">
          <v-icon>{{ videoEnabled ? icons.mdiCamera : icons.mdiCameraOff }}</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="refuse" elevation="0">
          <v-icon>{{ icons.mdiPhoneHangup }}</v-icon>
        </v-btn>
        <v-btn icon color="green" @click="agree" elevation="0" v-if="!videoed && role === 'PARTNER'">
          <v-icon>{{ icons.mdiVideo }}</v-icon>
        </v-btn>
      </v-app-bar>

      <div class="content-center" v-if="session && calledConfig.type === 'VIDEO'">
        <user-video
            :stream-manager="subStreamManager"
            :class=" {'other-video': isMainStream}"
            @click.native="updateMainVideoStreamManager"/>
        <user-video
            :stream-manager="mainStreamManager"
            :class=" {'other-video':!isMainStream }"
            @click.native="updateMainVideoStreamManager"/>
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

import {computed, onMounted, ref} from "@vue/composition-api";
import msg from "@/plugins/msg";
import {callVideo} from "@/net/send-message";
import {mdiCamera, mdiCameraOff, mdiMicrophone, mdiMicrophoneOff, mdiPhoneHangup, mdiVideo} from "@mdi/js";
import UserVideo from "@/components/system/openvidu/UserVideo";
import {audioVolume, du, mainStreamManager, session, subStreamManager} from "@/components/system/openvidu/OpenVidu";
import store from "@/store";

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
    const loadedRooms = computed(() => store.state.loadedRooms)
    const currentUserId = computed(() => store.state.currentUserId)
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
    const calledConfig = ref({})
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
      du.joinSession(props.room.roomId,currentUserId.value,calledConfig.value.type === 'VIDEO')
      clearTimeout(selfTimer.value)
    }

    const call = (type) => {
      console.log(type,'type')
      display.value = true
      role.value = 'HOST'
      if (props.room.isFriend) {
        const find = props.room.users.find(x => x._id !== currentUserId.value);
        callUser.value = find
        calledConfig.value = {
          userId: find._id,
          fromId: currentUserId.value,
          roomId: props.room.roomId,
          command: 'CALL',
          type: type
        }
        callVideo(calledConfig.value)
      } else {
        overVideo('暂不支持群组通讯,开发中.....')
      }
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
          du.joinSession(props.room.roomId,currentUserId.value, calledConfig.value.type === 'VIDEO')
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
      videoed.value = false
      role.value = ''
      clearTimeout(selfTimer.value)
      du.leaveSession()
      emit('close')
    }

    const changeAudio = () => {
      audioEnabled.value = !audioEnabled.value
      du.changeAudio(audioEnabled.value)
    }

    const changeVideo = () => {
      videoEnabled.value = !videoEnabled.value
      du.changeVideo(videoEnabled.value)
    }

    return {
      isMainStream,
      display,
      snackbar,
      videoed,
      role,
      mainStreamManager,
      session,
      subStreamManager,
      audioVolume,
      audioEnabled,
      videoEnabled,
      callUser,
      calledConfig,

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
