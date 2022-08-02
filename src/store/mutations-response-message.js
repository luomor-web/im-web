import { buildLastMessage, buildLastMessageTime, clearUnReadMessage } from '@/net/send-message'

import { nextTick } from '@vue/composition-api'
import store from '@/store/index'
import { ding, sortedUser } from '@/utils/system-util'
import msg from '@/plugins/msg'

export default {

    // 编辑用户信息返回
    COMMAND_EDIT_PROFILE_REST: (state, data) => {
        const { user } = data.data
        store.commit('setCurUser', user)
    },
    // 获取用户信息响应
    COMMAND_GET_USER_RESP: (state, data) => {
        const { groups } = data.data
        store.commit('setCurUser', data.data)
        groups.forEach(x => {
            x.lastMessage = buildLastMessageTime(x.lastMessage)
        })
        state.loadedRooms = [...groups]
        nextTick(() => {
            store.commit('setLoadingRooms', false)
            store.commit('setRoomsLoaded', true)
        })
        // 获取历史消息
        if (state.loadedRooms.length > 0) {
            store.commit('changeRoom', state.loadedRooms[0].roomId)
        }
    },

    // 用户配置响应
    COMMAND_USER_GROUP_CONFIG_RESP: (state, data) => {
        const { data: config } = data

        const index = state.loadedRooms.findIndex(r => r.roomId === config.roomId)
        if (index === -1) {
            return
        }
        switch (config.type) {
            case 'NOTICE':
                state.loadedRooms[index].notice = config.notice
                break
        }

        state.loadedRooms = [...state.loadedRooms]
    },

    // 获取历史消息响应
    COMMAND_GET_MESSAGE_RESP: (state, data) => {
        const { type, messages: loadMessages, returnDefault } = data.data
        if (loadMessages.length === 0) {
            nextTick(() => {
                if (type === 'DOWN') {
                    store.commit('setSearchMessage', false)
                } else {
                    store.commit('setMessageLoaded', true)
                }
            })
            return
        }
        if (returnDefault) {
            state.messages = []
            store.commit('setSearchMessage', false)
        }
        loadMessages.forEach(x => {
            const index = state.messages.findIndex(r => r._id === x._id)
            if (index === -1 && type === 'TOP') {
                state.messages.unshift(x)
            } else if (index === -1 && type === 'DOWN') {
                state.messages.push(x)
            }
        })

        if (loadMessages.length < 20) {
            nextTick(() => {
                if (type === 'DOWN') {
                    store.commit('setSearchMessage', false)
                } else {
                    store.commit('setMessageLoaded', true)
                }
            })
        }
    },

    // 聊天请求
    COMMAND_CHAT_RESP: (state, data) => {
        const message = data.data

        const roomIndex = state.loadedRooms.findIndex(
            r => message.roomId === r.roomId
        )

        if (state.loadedRooms[roomIndex].notice && message.senderId !== state.curUser._id) {
            ding()
        }

        // 设置最后一条消息
        const lastMessage = buildLastMessage(message)
        state.loadedRooms[roomIndex] = { ...state.loadedRooms[roomIndex], lastMessage }
        // 将目标消息置顶
        store.commit('upRoom', message.roomId)
        if (message.roomId === state.roomId) {
            clearUnReadMessage(state.roomId)
            if (state.currentUserId === message.senderId) {
                const checkIndex = state.messages.findIndex(r => r._id === message._id)
                if (checkIndex !== -1) {
                    state.messages[checkIndex] = message
                } else {
                    state.messages.push(message)
                }
                // 检查等待发送列表
                store.commit('removeWaitSendMessage', message._id)
            } else {
                state.messages.push(message)
            }
            if (state.messages.length > 42) {
              state.messages = [...state.message]
            } else {
              state.messages = [...state.messages.slice(state.messages.length - 40, state.messages.length)]
            }
            if (process.env.IS_ELECTRON) {
              const room = state.loadedRooms[roomIndex]
              window.require('electron').ipcRenderer.send('notify-list', {
                roomId: room.roomId,
                roomName: room.roomName,
                unreadCount: 1,
                avatar: room.avatar
              })
            }
            return
        }
        state.loadedRooms[roomIndex].unreadCount = message.unreadCount
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

    // 用户状态变化消息
    COMMAND_USER_STATUS_RESP: (state, data) => {
        const { group, user } = data.data

        const roomIndex = state.loadedRooms.findIndex(r => r.roomId === group.roomId)
        if (roomIndex === -1) return

        if (state.loadedRooms[roomIndex].friendId === user._id) {
            state.loadedRooms[roomIndex].avatar = user.avatar
            state.loadedRooms[roomIndex].roomName = user.username
        }

        const userIndex = state.loadedRooms[roomIndex].users.findIndex(r => r._id === user._id)
        if (userIndex !== -1) {
            state.loadedRooms[roomIndex].users[userIndex] = user
            state.loadedRooms[roomIndex].users = [...state.loadedRooms[roomIndex].users]
            state.loadedRooms[roomIndex].users = sortedUser(state.loadedRooms[roomIndex].users)
        }
        state.loadedRooms = [...state.loadedRooms]
    },

    // 加入群组返回
    COMMAND_JOIN_GROUP_NOTIFY_RESP: (state, data) => {
        const room = data.data.group
        const users = data.data.users
        const otherUsers = data.data.otherUsers
        const index = state.loadedRooms.findIndex(r => r.roomId === room.roomId)
        if (index === -1) {
            room.users = [...users]
            room.users.push(...otherUsers)
            state.loadedRooms[state.loadedRooms.length] = room
            state.loadedRooms = [...state.loadedRooms]
        } else {
            state.loadedRooms[index].users.push(...users)
            state.loadedRooms[index].users = sortedUser(state.loadedRooms[index].users)
            state.loadedRooms = [...state.loadedRooms]
        }
        setTimeout(() => {
            store.commit('setLoadingRooms', false)
            store.commit('setRoomsLoaded', true)
        })
        if (state.loadedRooms.length === 1) {
            store.commit('changeRoom', room.roomId)
        }

        // 如果加入的用户里包含创建者，那么切换位置
        const userIndex = users.findIndex(r => r._id === state.currentUserId)
        if (userIndex !== -1) {
            const user = users[userIndex]
            if (user.role === 'ADMIN') {
                store.commit('changeRoom', room.roomId)
            }
        }
    },

    // 表情回复
    COMMAND_SEND_MESSAGE_REACTION_RESP: (state, data) => {
        const reaction = data.data
        if (state.roomId !== reaction.roomId) {
            return
        }
        const messageIndex = state.messages.findIndex(r => reaction.messageId === r._id)
        if (messageIndex === -1) {
            return
        }

        if (state.messages[messageIndex].reactions) {
            state.messages[messageIndex].reactions = reaction.reactions
        } else {
            state.messages[messageIndex] = { ...state.messages[messageIndex], reactions: reaction.reactions }
        }
        state.messages = [...state.messages]
    },

    // 群组用户移除返回
    COMMAND_REMOVE_GROUP_USER_RESP: (state, data) => {
        const { userId, roomId: serveRoomId } = data.data
        const index = state.loadedRooms.findIndex(r => r.roomId === serveRoomId)
        if (userId === state.currentUserId) {
            state.loadedRooms.splice(index, 1)
            state.loadedRooms = [...state.loadedRooms]
            if (serveRoomId === state.roomId) {
                if (state.loadedRooms.length > 0) {
                    store.commit('changeRoom', state.loadedRooms[0].roomId)
                }
            }

            return
        }
        const userIndex = state.loadedRooms[index].users.findIndex(r => r._id === userId)
        state.loadedRooms[index].users.splice(userIndex, 1)

        state.loadedRooms = [...state.loadedRooms]
    },

    // 解散群聊响应
    COMMAND_DISBAND_GROUP_RESP: (state, data) => {
        const { roomId: disbandRoomId } = data.data
        const index = state.loadedRooms.findIndex(r => r.roomId === disbandRoomId)
        state.loadedRooms.splice(index, 1)
        state.loadedRooms = [...state.loadedRooms]

        if (disbandRoomId === state.roomId) {
            store.commit('changeRoom', state.loadedRooms[0]?.roomId)
        }
    },

    // 移交群主响应
    COMMAND_HANDOVER_GROUP_RESP: (state, data) => {
        const { roomId, oldAdmin, newAdmin } = data.data
        const index = state.loadedRooms.findIndex(r => r.roomId === roomId)

        const oldAdminIndex = state.loadedRooms[index].users.findIndex(r => r._id === oldAdmin)
        state.loadedRooms[index].users[oldAdminIndex].role = 'GENERAL'

        const newAdminIndex = state.loadedRooms[index].users.findIndex(r => r._id === newAdmin)
        state.loadedRooms[index].users[newAdminIndex].role = 'ADMIN'

        state.loadedRooms[index].users = sortedUser(state.loadedRooms[index].users)
        state.loadedRooms = [...state.loadedRooms]
    },

    // 修改群组信息响应
    COMMAND_EDIT_GROUP_PROFILE_RESP: (state, data) => {
        const { roomId: changeRoomId, roomName, avatar } = data.data
        const index = state.loadedRooms.findIndex(r => r.roomId === changeRoomId)
        state.loadedRooms[index].roomName = roomName
        state.loadedRooms[index].avatar = avatar

        state.loadedRooms = [...state.loadedRooms]
    },

    // 删除群组信息响应
    COMMAND_MESSAGE_DELETE_RESP: (state, data) => {
        const { _id, roomId: messageRoomId, isLastMessage } = data.data
        if (messageRoomId === state.roomId) {
            const index = state.messages.findIndex(r => r._id === _id)
            if (index !== -1) {
                state.messages[index].deleted = true
                state.messages = [...state.messages]
            }
            if (isLastMessage) {
                const lastMessage = buildLastMessage(data.data)
                const roomIndex = state.loadedRooms.findIndex(r => r.roomId === messageRoomId)
                state.loadedRooms[roomIndex].lastMessage = lastMessage
                state.loadedRooms = [...state.loadedRooms]
            }
        }
    },

    // 系统会话创建响应
    COMMAND_SYSTEM_MESSAGE_RESP: (state, data) => {
      const room = data.data.group
      const users = data.data.users
      const index = state.loadedRooms.findIndex(r => r.roomId === room.roomId)
      if (index === -1) {
        room.users = users
        state.loadedRooms[state.loadedRooms.length] = room
        state.loadedRooms = [...state.loadedRooms]
      }
      if (state.loadedRooms.length === 1) {
        store.commit('changeRoom', room.roomId)
      }
    },

    // 已读消息响应
    COMMAND_MESSAGE_READ_RESP: (state, data) => {
        const { roomId: messageRoomId, messageId } = data.data

        if (messageRoomId === state.roomId) {
            const index = state.messages.findIndex(r => r._id === messageId)
            if (index !== -1) {
                state.messages[index].seen = true
                state.messages = [...state.messages]
            }
        }

        const index = state.loadedRooms.findIndex(r => r.roomId === messageRoomId)
        if (state.loadedRooms[index].lastMessage.messageId === messageId) {
            state.loadedRooms[index].lastMessage.seen = true
            state.loadedRooms = [...state.loadedRooms]
        }
    },

    // 自己的表情包返回
    COMMAND_EMOTICON_RESP: (state, data) => {
      data.data.forEach(x => {
        const index = state.userEmoticons.findIndex(r => r._id === x._id)
        if (index === -1) {
          state.userEmoticons.push(x)
        }
      })
      state.userEmoticonLoaded = data.data < 20
    },

    COMMAND_EMOTICON_OPERATION_RESP: (state, data) => {
      const { type, emoticon } = data.data
      switch (type) {
        case 'INSERT_EMOTICON_TO_USER':
          if (state.userEmoticons.findIndex(r => r._id === emoticon._id) === -1) {
            state.userEmoticons.unshift(emoticon)
          }
          break
        case 'INSERT_TO_USER':
          if (state.userEmoticons.findIndex(r => r._id === emoticon._id) === -1) {
            state.userEmoticons.unshift(emoticon)
          }
          msg.$emit('INSERT_TO_USER_MSG', data)
          break
        case 'DELETE':
          state.userEmoticons.splice(state.userEmoticons.findIndex(r => r._id === emoticon._id), 1)
          msg.$emit('DELETE_MSG', data)
      }
    }

}
