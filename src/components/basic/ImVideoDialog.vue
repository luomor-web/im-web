<template>
  <v-expand-transition>
    <v-card v-show="display" v-drag class="video-content">
      <v-app-bar dense class="px-3" elevation="0">
        <v-avatar color="#b7c1ca" size="30">
          <img
            :src="callUser.avatar"
           alt=""
          />
        </v-avatar>

        <v-toolbar-title class="ml-1">
          {{ callUser.username }}
        </v-toolbar-title>

        <v-spacer />
        <v-btn v-if="videoed || role === 'HOST'" icon @click="changeAudio">
          <v-icon>{{ audioEnabled ? icons.mdiMicrophone : icons.mdiMicrophoneOff }}</v-icon>
        </v-btn>
        <v-btn v-if="(videoed || role === 'HOST') && calledConfig.type === 'VIDEO'" icon @click="changeVideo">
          <v-icon>{{ videoEnabled ? icons.mdiCamera : icons.mdiCameraOff }}</v-icon>
        </v-btn>
        <v-btn icon color="red" elevation="0" @click="refuse">
          <v-icon>{{ icons.mdiPhoneHangup }}</v-icon>
        </v-btn>
        <v-btn v-if="!videoed && role === 'PARTNER'" icon color="green" elevation="0" @click="agree">
          <v-icon>{{ icons.mdiVideo }}</v-icon>
        </v-btn>
      </v-app-bar>
      <v-progress-linear
        :active="!!session"
        :value="audioVolume"
        absolute
        top
        color="deep-purple accent-4"
      />
      <div v-if="session && calledConfig.type === 'VIDEO'" class="content-center">
        <user-video
          :stream-manager="subStreamManager"
          :class=" {'other-video': isMainStream}"
          @click.native="updateMainVideoStreamManager"
        />
        <user-video
          :stream-manager="mainStreamManager"
          :class=" {'other-video':!isMainStream }"
          @click.native="updateMainVideoStreamManager"
        />
      </div>
    </v-card>
  </v-expand-transition>
</template>

<script>

import { computed, onMounted, onUnmounted, ref } from '@vue/composition-api'
import msg from '@/plugins/msg'
import { callVideo } from '@/net/send-message'
import { mdiCamera, mdiCameraOff, mdiMicrophone, mdiMicrophoneOff, mdiPhoneHangup, mdiVideo } from '@mdi/js'
import UserVideo from '@/components/basic/openvidu/UserVideo'
import { audioVolume, du, mainStreamManager, session, subStreamManager } from '@/components/basic/openvidu/OpenVidu'
import store from '@/store'
import tip from '@/plugins/tip'

export default {
  name: 'ImVideoDialog',
  comments: {},
  components: { UserVideo },
  // ??????????????? ???????????????
  directives: {
    drag (el) {
      el.onmousedown = function (e) {
        const disX = e.pageX - el.offsetLeft
        const disY = e.pageY - el.offsetTop

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

  setup (props, { emit }) {
    const room = computed(() => store.getters.curRoom)
    const loadedRooms = computed(() => store.state.loadedRooms)
    const currentUserId = computed(() => store.state.currentUserId)
    // ????????????
    const audioEnabled = ref(true)
    // ????????????
    const videoEnabled = ref(true)
    // ??????????????????????????????
    const isMainStream = ref(true)

    // ??????
    const role = ref('')

    // ??????????????????
    const display = ref(false)
    // ?????????????????????
    const videoed = ref(false)
    // ????????????
    const calledConfig = ref({})
    // ?????????
    const selfTimer = ref(null)
    // ??????/????????? ??????
    const callUser = ref({})

    // ?????????????????????
    const refuse = () => {
      const param = {
        ...calledConfig.value,
        command: role.value === 'HOST' ? 'CALLED_REFUSE' : 'BE_CALLED_REFUSE'
      }
      callVideo(param)
      overVideo('????????????')
    }

    const agree = () => {
      const param = {
        ...calledConfig.value,
        command: 'AGREE'
      }
      callVideo(param)
      videoed.value = true
      du.joinSession({
        roomId: room.value.roomId,
        sessionId: currentUserId.value,
        enableVideo: calledConfig.value.type === 'VIDEO'
      }, (text) => {
        sendTip(text)
      })
      clearTimeout(selfTimer.value)
    }

    const call = (type) => {
      if (room.value.isFriend) {
        display.value = true
        role.value = 'HOST'
        const find = room.value.users.find(x => x._id !== currentUserId.value)
        callUser.value = find
        calledConfig.value = {
          userId: find._id,
          fromId: currentUserId.value,
          roomId: room.value.roomId,
          command: 'CALL',
          type
        }
        callVideo(calledConfig.value)
      } else {
        overVideo('????????????????????????,?????????.....')
      }
    }

    onMounted(() => {
      msg.$on('COMMAND_VIDEO_RESP', COMMAND_VIDEO_RESP)
    })

    onUnmounted(() => {
      msg.$off('COMMAND_VIDEO_RESP')
    })

    const COMMAND_VIDEO_RESP = async (data) => {
      switch (data.data.command) {
        // ???????????????
        case 'CALL': {
          display.value = true
          role.value = 'PARTNER'
          calledConfig.value = data.data
          const room = loadedRooms.value.find(x => x.roomId === calledConfig.value.roomId)
          callUser.value = room.users.find(x => x._id === calledConfig.value.fromId)
          selfTimer.value = setTimeout(() => {
            overVideo('?????????')
          }, 20000)
          break
        }
        case 'AGREE':
          clearTimeout(selfTimer.value)
          sendTip('?????????')
          break
        case 'BE_CALLED_REFUSE':
          // ???????????????
          overVideo('???????????????')
          break
        // ?????????????????????
        case 'NOT_ONLINE':
          sendTip('???????????????')
          setTimeout(() => {
            display.value = false
          }, 1000)
          break
        case 'REQ_SUCCESS':
          selfTimer.value = setTimeout(() => {
            overVideo('???????????????')
          }, 20000)
          du.joinSession({
            roomId: room.value.roomId,
            sessionId: currentUserId.value,
            enableVideo: calledConfig.value.type === 'VIDEO'
          }, (text) => {
            sendTip(text)
          })
          break
        case 'CALLED_REFUSE':
          // ?????????
          overVideo('???????????????')
          break
        default:
          break
      }
    }

    const updateMainVideoStreamManager = () => {
      isMainStream.value = !isMainStream.value
    }

    const overVideo = (text) => {
      sendTip(text)
      setTimeout(() => {
        display.value = false
      }, 1000)
      videoed.value = false
      role.value = ''
      clearTimeout(selfTimer.value)
      du.leaveSession()
      emit('close')
    }

    const sendTip = (text) => {
      tip.info(text, 1000)
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
      room,
      isMainStream,
      display,
      tip,
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
