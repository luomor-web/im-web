import responseMessage from './mutations-response-message'

import store from '@/store/index'
import { clearUnReadMessage, getHistoryMessage, sendChatMessage } from '@/net/send-message'
import { sortedUser } from '@/utils/system-util'
import Vue from 'vue'

export default {

  resetData: (state) => {
    state.loadedRooms = []
    state.curUser = { _id: '' }
    state.loadingRooms = false
    state.roomsLoaded = true
    state.messages = []
    state.messageLoaded = false
    state.searchMessage = false
    state.currentUserId = ''
    state.roomId = ''
    state.waitSendMessage = []
    state.timers = new Map()
    state.informationPane = ''
    state.settingPane = ''
    state.userEmoticonLoaded = false
    state.userEmoticons = []
  },

  unmounted: (state) => {
    state.loadedRooms = []
    state.loadingRooms = false
    state.roomsLoaded = true
    state.messages = []
    state.messageLoaded = false
    state.searchMessage = false
    state.roomId = '1'
    state.waitSendMessage = []
    state.timers = new Map()
    state.informationPane = ''
    state.settingPane = ''
    state.userEmoticonLoaded = false
    state.userEmoticons = []
  },

  setInformationPane: (state, active) => { state.informationPane = active },

  setSettingPane: (state, active) => { state.settingPane = active },

  setRoomId: (state, roomId) => { state.roomId = roomId },

  setCurUser: (state, user) => { state.curUser = { ...user } },

  setCurrentUserId: (state, userId) => { state.currentUserId = userId },

  pushMessage: (state, message) => {
    state.messages.push(message)
    state.messages = [...state.messages]
  },

  setMessageLoaded: (state, messageLoaded) => { state.messageLoaded = messageLoaded },

  setSearchMessage: (state, searchMessage) => { state.searchMessage = searchMessage },

  setRoomsLoaded: (state, roomsLoaded) => { state.roomsLoaded = roomsLoaded },

  setLoadingRooms: (state, loadingRooms) => { state.loadingRooms = loadingRooms },

  sortRoomUsers: (state, roomId) => {
    const roomIndex = state.loadedRooms.findIndex(r => roomId === r.roomId)
    state.loadedRooms[roomIndex].users = sortedUser(state.loadedRooms[roomIndex].users)
    state.loadedRooms[roomIndex].users = [...state.loadedRooms[roomIndex].users]
    state.loadedRooms[roomIndex].unreadCount = 0
    state.loadedRooms = [...state.loadedRooms]
    if (process.env.IS_ELECTRON) {
      const room = state.loadedRooms[roomIndex]
      window.require('electron').ipcRenderer.send('notify-list', {
        roomId: room.roomId,
        roomName: room.roomName,
        unreadCount: room.unreadCount,
        avatar: room.avatar
      })
    }
  },

  changeRoom: (state, item) => {
    if (!item || item === state.roomId) return
    store.commit('clearMessages')
    store.commit('pushWaitSendMessageToMessages', item)
    store.commit('setMessageLoaded', false)
    store.commit('setSearchMessage', false)
    store.commit('setRoomId', item)
    store.commit('sortRoomUsers', item)
    getHistoryMessage({ roomId: item })
    clearUnReadMessage(item)
  },

  clearMessages: (state) => {
    state.messages = []
  },

  removeMessage: (state, messageId) => {
    const index = state.messages.findIndex(x => x._id === messageId)
    if (index !== -1) {
      state.messages.splice(index, 1)
      state.messages = [...state.messages]
    }
  },

  updateMessageFileProgress: (state, { file, messageId }) => {
    const message = state.messages.find(r => r._id === messageId)
    if (!message || !message.files) return

    message.files.find(r => r.id === file.id).progress = file.progress
    state.messages = [...state.messages]
  },

  pushWaitSendMessageToMessages: (state, roomId) => {
    const filter = state.waitSendMessage.filter(x => x.roomId === roomId)
    filter.forEach(x => {
      state.messages.push(x)
    })
  },

  upRoom: (state, roomId) => {
    const roomIndex = state.loadedRooms.findIndex(r => roomId === r.roomId)
    if (roomIndex === -1) {
      return
    }
    if (state.loadedRooms[roomIndex].index !== 9999999999999) {
      state.loadedRooms[roomIndex].index = new Date().getTime()
    }
    state.loadedRooms = [...state.loadedRooms]
  },
  addWaitSendMessage: (state, { message, haveFile }) => {
    state.waitSendMessage.push(message)
    if (!haveFile) {
      store.commit('setCheckTimer', message)
    }
  },

  setWaitSendMessageFail: (state, messageId) => {
    const waitIndex = state.waitSendMessage.findIndex(r => r._id === messageId)
    if (waitIndex !== -1) {
      state.waitSendMessage[waitIndex].failure = true
    }
    state.waitSendMessage = [...state.waitSendMessage]
  },

  removeWaitSendMessage: (state, messageId) => {
    const waitIndex = state.waitSendMessage.findIndex(r => r._id === messageId)
    if (waitIndex !== -1) {
      state.waitSendMessage.splice(waitIndex, 1)
    }
    store.commit('deleteTimer', messageId)
  },

  handleFailMessage: (state, messageId) => {
    const message = state.messages.find(r => r._id === messageId)
    if (!message) return
    message.failure = true
    message.files?.forEach(x => { x.progress = -1 })
    state.messages = [...state.messages]

    store.commit('setWaitSendMessageFail', messageId)
    store.commit('deleteTimer', messageId)
  },

  sendFileMessage: (state, { file, roomId, isLast }) => {
    const index = state.waitSendMessage.findIndex(r => r.roomId === roomId)
    if (index === -1) return

    const fileIndex = state.waitSendMessage[index].files.findIndex(f => f.id === file.id)
    if (fileIndex === -1) return

    state.waitSendMessage[index].files[fileIndex] = file
    if (!isLast) return

    store.commit('setCheckTimer', state.waitSendMessage[index])
    sendChatMessage(state.waitSendMessage[index])
  },

  setCheckTimer: (state, message) => {
    const t = setTimeout(() => {
      store.commit('handleFailMessage', message._id)
    }, 12000)
    store.commit('putTimer', { id: message._id, t })
  },

  putTimer: (state, { id, t }) => {
    Vue.set(state.timers, id, t)
  },

  deleteTimer: (state, id) => {
    const t = state.timers[id]
    if (t) {
      clearTimeout(t)
    }
    Vue.delete(state.timers, id)
  },

  pushDownloadItem: (state, file) => {
    state.downloadItemList.unshift(file)
    state.downloadItemList = state.downloadItemList.slice(0, 60)
  },
  updateDownloadItem: (state, { args, status }) => {
    // ??????ID????????????
    const index = state.downloadItemList.findIndex(x => x.id === args.id)
    if (index === -1) return
    state.downloadItemList[index].state = status
    if (args.receivedBytes) {
      state.downloadItemList[index].receivedBytes = args.receivedBytes
    }
    if (args.totalBytes) {
      state.downloadItemList[index].totalBytes = args.totalBytes
    }
    state.downloadItemList = [...state.downloadItemList]
  },
  removeDownloadItem: (state, args) => {
    const index = state.downloadItemList.findIndex(x => x.id === args.id)
    if (index === -1) return
    state.downloadItemList.splice(index, 1)
  },
  clearDownloadingItem: (state) => {
    const downloadFileListTemp = []
    state.downloadItemList?.forEach(x => {
      if (x.state === 'done' || x.state === 'not-found') {
        downloadFileListTemp.push(x)
      }
    })
    state.downloadItemList = [...downloadFileListTemp]
  },

  setAutoDownload: (state, item) => { state.autoDownloa = item },

  setAutoStart: (state, item) => { state.autoStart = item },

  setDownloadPath: (state, path) => { state.downloadPath = path },

  clearEmoticons: (state) => { state.emoticons = [] },

  // ???????????????
  pushEmoticons: (state, data) => {
    data.forEach(x => {
      const index = state.emoticons.findIndex(r => r._id === x._id)
      if (index === -1) {
        state.emoticons.push(x)
      }
    })
  },

  setAudioDeviceId: (state, data) => {
    state.audioDeviceId = data
  },

  setVideoDeviceId: (state, data) => {
    state.videoDeviceId = data
  },
  ...responseMessage
}
