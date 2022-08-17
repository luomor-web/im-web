<template>
  <div class="fill-height">
    <drawer-top title="视频通话" :sub="true" @close="open('SETTING_ITEM')" />

    <v-list nav>
      <v-subheader class="pl-2">
        音频设置
      </v-subheader>
      <v-list-item v-ripple class="im-list-item">
        <v-list-item-content class="pa-0">
          <v-select
            v-model="audioSelect"
            :items="audios"
            item-text="label"
            item-value="deviceId"
            @input="audioSelectInput"
          />
        </v-list-item-content>
        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon
                     v-bind="attrs"
                     v-on="on"
                     @click="checking('audio')"
              >
                <v-icon>{{ audioChecking ? icons.mdiStop : icons.mdiPlay }}</v-icon>
              </v-btn>
            </template>
            <span>{{ audioChecking ? '停止' : '检测' }}</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
      <v-progress-linear
        :active="audioChecking"
        :value="audioVolume"
        color="deep-purple accent-4"
      />
    </v-list>

    <v-list nav>
      <v-subheader class="pl-2">
        视频设置
      </v-subheader>
      <v-list-item v-ripple class="im-list-item">
        <v-list-item-content class="pa-0">
          <v-select
            v-model="videoSelect"
            :items="videos"
            item-text="label"
            item-value="deviceId"
          />
        </v-list-item-content>
        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon
                     v-bind="attrs"
                     v-on="on"
                     @click="checking('video')"
              >
                <v-icon>{{ videoChecking ? icons.mdiStop : icons.mdiPlay }}</v-icon>
              </v-btn>
            </template>
            <span>{{ videoChecking ? '停止' : '检测' }}</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
      <user-video
        v-if="videoChecking"
        :stream-manager="mainStreamManager"
      />
    </v-list>
  </div>
</template>

<script>
import UserVideo from '../basic/openvidu/UserVideo'
import DrawerTop from '@/components/basic/DrawerTop'
import { computed, onMounted, onUnmounted, ref } from '@vue/composition-api'
import store from '@/store'
import { mdiPlay, mdiStop } from '@mdi/js'
import { audioVolume, du, getDeviceList, mainStreamManager } from '../basic/openvidu/OpenVidu'
import tip from '@/plugins/tip'

export default {
  name: 'SettingVideo',
  components: {
    DrawerTop,
    UserVideo
  },
  setup() {
    const audioSelect = ref('')
    const videoSelect = ref('')
    const audioStore = computed(() => store.state.audioDeviceId)
    const videoStore = computed(() => store.state.videoDeviceId)
    const currentUserId = computed(() => store.state.currentUserId)
    const audioChecking = ref(false)
    const videoChecking = ref(false)
    const audios = ref([])
    const videos = ref([])

    onMounted(async () => {
      await initDeviceList()
      audioSelect.value = audioStore.value
      videoSelect.value = videoStore.value
    })

    onUnmounted(() => {
      audioChecking.value = false
      videoChecking.value = false
      du.leaveSession()
    })

    const audioSelectInput = (item) => {
      store.commit('setAudioDeviceId', item)
    }

    const checking = (type) => {
      const isAudio = type === 'audio'
      // 先关掉
      du.leaveSession()
      // 如果是音频
      if (isAudio) {
        audioChecking.value = !audioChecking.value
        if (videoChecking.value) videoChecking.value = false
        if (!audioChecking.value) return
      } else {
        videoChecking.value = !videoChecking.value
        if (audioChecking.value) audioChecking.value = false
        if (!videoChecking.value) {
          return
        }
      }

      du.joinSession({
        roomId: 'test',
        sessionId: currentUserId.value,
        enableAudio: isAudio,
        enableVideo: !isAudio,
        audioSource: audioStore.value,
        videoSource: videoStore.value
      }, (text) => {
        tip.info(text)
      })
    }

    const initDeviceList = async () => {
      const devices = await getDeviceList()
        audios.value = devices.filter(x => x.kind === 'audioinput' && x.label)
        if (!audioStore.value && audios.value?.length > 0) {
          store.commit('setAudioDeviceId', audios.value[0].deviceId)
        }
        videos.value = devices.filter(x => x.kind === 'videoinput' && x.label)
        if (!videoStore.value && videos.value?.length > 0) {
          store.commit('setVideoDeviceId', videos.value[0].deviceId)
        }
    }

    const open = (item) => {
      audioChecking.value = false
      videoChecking.value = false
      du.leaveSession()
      store.commit('setSettingPane', item)
    }

    return {
      open,
      audios,
      audioSelect,
      checking,
      videos,
      videoSelect,
      videoChecking,
      audioChecking,
      audioSelectInput,
      audioVolume,
      mainStreamManager,

      icons: {
        mdiPlay,
        mdiStop
      }
    }
  }
}
</script>

<style scoped>

</style>
