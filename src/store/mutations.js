import responseMessage from './mutations-response-message'

import store from "@/store/index";
import {clearUnReadMessage, getHistoryMessage, sendChatMessage} from "@/net/send-message";
import {sortedUser} from "@/utils/system-util";
import Vue from "vue";

export default {

    resetDate: (state) => {
        state.loadedRooms = []
        state.curUser = {_id: ''}
        state.loadingRooms = false
        state.roomsLoaded = true
        state.messages = []
        state.messageLoaded = false
        state.searchMessage = false
        state.currentUserId = ''
        state.roomId = ''
        state.waitSendMessage = []
        state.timers = new Map()
    },

    setInformationPane:(state, active) => state.informationPane = active,

    setRoomId: (state, roomId) => state.roomId = roomId,

    setCurUser: (state, user) => state.curUser = {...user},

    setCurrentUserId: (state, userId) => state.currentUserId = userId,

    pushMessage: (state, message) => {
        state.messages.push(message)
        state.messages = [...state.messages]
    },

    setMessageLoaded: (state, messageLoaded) => state.messageLoaded = messageLoaded,

    setSearchMessage: (state, searchMessage) => state.searchMessage = searchMessage,

    setRoomsLoaded: (state, roomsLoaded) => state.roomsLoaded = roomsLoaded,

    setLoadingRooms: (state, loadingRooms) => state.loadingRooms = loadingRooms,

    sortRoomUsers: (state, roomId) => {
        const roomIndex = state.loadedRooms.findIndex(r => roomId === r.roomId)
        state.loadedRooms[roomIndex].users = sortedUser(state.loadedRooms[roomIndex].users)
        state.loadedRooms[roomIndex].users = [...state.loadedRooms[roomIndex].users]
        state.loadedRooms[roomIndex].unreadCount = 0;
        state.loadedRooms = [...state.loadedRooms]
    },

    changeRoom: (state, item) => {
        if (!item) return
        store.commit('clearMessages')
        store.commit('pushWaitSendMessageToMessages', item)
        store.commit('setMessageLoaded', false)
        store.commit('setSearchMessage', false)
        store.commit('setRoomId', item)
        store.commit('sortRoomUsers', item)
        getHistoryMessage({roomId: item})
        clearUnReadMessage(item)
    },

    clearMessages: (state) => {
        state.messages = state.messages.splice(0, state.messages.length)
        state.messages = []
    },

    remoteMessage: (state, messageId) => {
        const index = state.messages.findIndex(x => x._id === messageId);
        if (index !== -1) {
            state.messages.splice(index, 1)
            state.messages = [...state.messages]
        }
    },

    updateMessageFileProgress: (state, {file, messageId}) => {
        const message = state.messages.find(r => r._id === messageId);
        if (!message || !message.files) return

        message.files.find(r => r.id === file.id).progress = file.progress
        state.messages = [...state.messages]
    },

    pushWaitSendMessageToMessages: (state, roomId) => {
        const filter = state.waitSendMessage.filter(x => x.roomId === roomId);
        filter.forEach(x => {
            state.messages.push(x)
        })
    },

    upRoom: (state, roomId) => {
        const roomIndex = state.loadedRooms.findIndex(r => roomId === r.roomId)
        if (roomIndex === -1) {
            return
        }
        state.loadedRooms[roomIndex].index = new Date().getTime()
        state.loadedRooms = [...state.loadedRooms]
    },
    addWaitSendMessage: (state, {message, haveFile}) => {
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
        const message = state.messages.find(r => r._id === messageId);
        if (!message) return
        message.failure = true
        message.files?.forEach(x => x.progress = -1)
        state.messages = [...state.messages]

        store.commit('setWaitSendMessageFail', messageId)
        store.commit('deleteTimer', messageId)
    },

    sendFileMessage: (state, {file, roomId, isLast}) => {
        const index = state.waitSendMessage.findIndex(r => r.roomId === roomId)
        if (index === -1) return

        const fileIndex = state.waitSendMessage[index].files.findIndex(f => f.id === file.id);
        if (fileIndex === -1) return

        state.waitSendMessage[index].files[fileIndex] = file
        if (!isLast) return

        store.commit('setCheckTimer', state.waitSendMessage[index])
        sendChatMessage(state.waitSendMessage[index])
    },

    setCheckTimer: (state, message) => {
        const t = setTimeout(() => {
            store.commit('handleFailMessage', message._id)
        }, 12000);
        store.commit('putTimer', {id: message._id, t})
    },

    putTimer: (state, {id, t}) => {
        console.log(id, t, state.timers)
        Vue.set(state.timers, id, t)
    },

    deleteTimer: (state, id) => {
        const t = state.timers[id];
        if (t) {
            clearTimeout(t)
        }
        Vue.delete(state.timers,id)
    },
    ...responseMessage
}
