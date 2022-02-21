import {nextTick} from "@vue/composition-api";
import msg from "@/plugins/msg";
import {buildLastMessage, buildLastMessageTime, clearUnReadMessage} from "@/net/message";
import {
    changeRoom, currentUserId,
    curUser, ding,
    loadedRooms,
    loadingRooms,
    messageLoaded,
    messages,
    page, roomId,
    roomsLoaded, sortedUser, upRoom, waitSelectUser, waitSendMessage
} from "@/views/home/home";

export const init = () => {
    // 获取用户信息响应
    msg.$on("COMMAND_GET_USER_RESP", COMMAND_GET_USER_RESP)
    // 获取历史消息响应
    msg.$on("COMMAND_GET_MESSAGE_RESP", COMMAND_GET_MESSAGE_RESP)
    // 聊天请求
    msg.$on("COMMAND_CHAT_RESP", COMMAND_CHAT_RESP)
    // 用户状态变化消息
    msg.$on("COMMAND_USER_STATUS_RESP", COMMAND_USER_STATUS_RESP)
    // 加入群组返回
    msg.$on("COMMAND_JOIN_GROUP_NOTIFY_RESP", COMMAND_JOIN_GROUP_NOTIFY_RESP)
    // 表情回复
    msg.$on("COMMAND_SEND_MESSAGE_REACTION_RESP", COMMAND_SEND_MESSAGE_REACTION_RESP)
    // 编辑用户信息返回
    msg.$on("COMMAND_EDIT_PROFILE_REST", COMMAND_EDIT_PROFILE_REST)
    // 群组用户移除返回
    msg.$on("COMMAND_REMOVE_GROUP_USER_RESP", COMMAND_REMOVE_GROUP_USER_RESP)
    // 解散群聊响应
    msg.$on("COMMAND_DISBAND_GROUP_RESP", COMMAND_DISBAND_GROUP_RESP)
    // 移交群主响应
    msg.$on("COMMAND_HANDOVER_GROUP_RESP", COMMAND_HANDOVER_GROUP_RESP)
    // 修改群组信息响应
    msg.$on("COMMAND_EDIT_GROUP_PROFILE_RESP", COMMAND_EDIT_GROUP_PROFILE_RESP)
    // 删除群组信息响应
    msg.$on("COMMAND_MESSAGE_DELETE_RESP", COMMAND_MESSAGE_DELETE_RESP)
    // 已读消息响应
    msg.$on("COMMAND_MESSAGE_READ_RESP", COMMAND_MESSAGE_READ_RESP)
    // 全部人员列表
    msg.$on("COMMAND_USER_LIST_RESP", COMMAND_USER_LIST_RESP)
    // 系统消息会话
    msg.$on("COMMAND_SYSTEM_MESSAGE_RESP", COMMAND_JOIN_GROUP_NOTIFY_RESP)
    // 用户配置响应
    msg.$on("COMMAND_USER_GROUP_CONFIG_RESP", COMMAND_USER_GROUP_CONFIG_RESP)

}

// 获取用户信息响应
const COMMAND_GET_USER_RESP = (data) => {
    const {groups} = data.data

    curUser.value = data.data
    groups.forEach(x => {
        x.lastMessage = buildLastMessageTime(x.lastMessage)
    })
    loadedRooms.value = [...groups]
    nextTick(() => {
        loadingRooms.value = false
        roomsLoaded.value = true
    })
    // 获取历史消息
    if (loadedRooms.value.length > 0) {
        changeRoom(loadedRooms.value[0].roomId)
    }
}

// 获取历史消息响应
const COMMAND_GET_MESSAGE_RESP = (data) => {
    if (data.data.length === 0) {
        setTimeout(() => {
            messageLoaded.value = true
        })
        return
    }
    page.value += 1
    data.data.forEach(x => {
        const index = messages.value.findIndex(r => r._id === x._id);
        if (index === -1) {
            messages.value.unshift(x)
        }
    })
}

// 聊天请求
const COMMAND_CHAT_RESP = (data) => {
    const message = data.data

    const roomIndex = loadedRooms.value.findIndex(
        r => message.roomId === r.roomId
    )

    if (loadedRooms.value[roomIndex].notice && message.senderId !== curUser.value._id) {
        ding()
    }

    const lastMessage = buildLastMessage(message)

    if (!loadedRooms.value[roomIndex].lastMessage) {

        loadedRooms.value[roomIndex] = {
            ...loadedRooms.value[roomIndex],
            lastMessage
        }
    } else {
        loadedRooms.value[roomIndex].lastMessage = lastMessage
    }

    if (message.roomId === roomId.value) {
        clearUnReadMessage(roomId.value)
        if (currentUserId.value === message.senderId) {
            const checkIndex = messages.value.findIndex(r => r._id === message._id)
            if (checkIndex !== -1) {
                messages.value[checkIndex] = message
                messages.value = [...messages.value]
            } else {
                messages.value.push(message)
            }
            // 检查等待发送列表
            const waitIndex = waitSendMessage.value.findIndex(r => r._id === message._id)
            if (waitIndex !== -1) {
                waitSendMessage.value.splice(waitIndex, 1)
            }
        } else {
            messages.value.push(message)
        }
        return
    }
    // 将目标消息置顶
    upRoom(message.roomId)
    loadedRooms.value[roomIndex].unreadCount = message.unreadCount
    loadedRooms.value = [...loadedRooms.value]
}

// 用户状态变化消息
const COMMAND_USER_STATUS_RESP = (data) => {
    const {group, user} = data.data

    const roomIndex = loadedRooms.value.findIndex(r => r.roomId === group.roomId)
    if (roomIndex === -1) return

    if (loadedRooms.value[roomIndex].friendId === user._id) {
        loadedRooms.value[roomIndex].avatar = user.avatar
        loadedRooms.value[roomIndex].roomName = user.username
    }

    const userIndex = loadedRooms.value[roomIndex].users.findIndex(r => r._id === user._id)
    if (userIndex !== -1) {
        loadedRooms.value[roomIndex].users[userIndex] = user
        loadedRooms.value[roomIndex].users = [...loadedRooms.value[roomIndex].users]
        loadedRooms.value[roomIndex].users = sortedUser(loadedRooms.value[roomIndex].users)
    }
    loadedRooms.value = [...loadedRooms.value]

}

// 加入群组返回
const COMMAND_JOIN_GROUP_NOTIFY_RESP = (data) => {
    let room = data.data.group
    let users = data.data.users
    const index = loadedRooms.value.findIndex(r => r.roomId === room.roomId);
    if (index === -1) {
        room.users = users
        loadedRooms.value[loadedRooms.value.length] = room
        loadedRooms.value = [...loadedRooms.value]
    } else {
        loadedRooms.value[index].users.push(...users)
        loadedRooms.value[index].users = sortedUser(loadedRooms.value[index].users)
        loadedRooms.value = [...loadedRooms.value]
    }
    setTimeout(() => {
        loadingRooms.value = false
        roomsLoaded.value = true
    })
    if (loadedRooms.value.length === 1) {
        changeRoom(room.roomId)
    }

    // 如果加入的用户里包含创建者，那么切换位置
    const userIndex = users.findIndex(r => r._id === currentUserId.value);
    if (userIndex !== -1) {
        const user = users[userIndex];
        if (user.role === 'ADMIN') {
            changeRoom(room.roomId)
        }
    }

}

// 表情回复
const COMMAND_SEND_MESSAGE_REACTION_RESP = (data) => {
    const reaction = data.data
    if (roomId.value !== reaction.roomId) {
        return
    }
    const messageIndex = messages.value.findIndex(r => reaction.messageId === r._id)
    if (messageIndex === -1) {
        return;
    }

    if (messages.value[messageIndex].reactions) {
        messages.value[messageIndex].reactions = reaction.reactions
    } else {
        messages.value[messageIndex] = {...messages.value[messageIndex], reactions: reaction.reactions}
    }
    messages.value = [...messages.value]
}

// 编辑用户信息返回
const COMMAND_EDIT_PROFILE_REST = (data) => {
    const {user} = data.data
    curUser.value = {...user}
}

// 群组用户移除返回
const COMMAND_REMOVE_GROUP_USER_RESP = (data) => {
    const {userId} = data.data
    const room_id = data.data.roomId
    const index = loadedRooms.value.findIndex(r => r.roomId === room_id);
    if (userId === currentUserId.value) {
        loadedRooms.value.splice(index, 1)
        loadedRooms.value = [...loadedRooms.value]
        if (room_id === roomId.value) {
            if (loadedRooms.value.length > 0) {
                changeRoom(loadedRooms.value[0].roomId)
            }
        }

        return
    }
    const userIndex = loadedRooms.value[index].users.findIndex(r => r._id === userId);
    loadedRooms.value[index].users.splice(userIndex, 1)

    loadedRooms.value = [...loadedRooms.value]

}

// 解散群聊响应
const COMMAND_DISBAND_GROUP_RESP = (data) => {
    const {roomId: disbandRoomId} = data.data
    const index = loadedRooms.value.findIndex(r => r.roomId === disbandRoomId);
    loadedRooms.value.splice(index, 1)
    loadedRooms.value = [...loadedRooms.value]

    if (disbandRoomId === roomId.value) {
        changeRoom(loadedRooms.value[0]?.roomId)
    }
}

// 移交群主响应
const COMMAND_HANDOVER_GROUP_RESP = (data) => {
    const {roomId, oldAdmin, newAdmin} = data.data
    const index = loadedRooms.value.findIndex(r => r.roomId === roomId);

    const oldAdminIndex = loadedRooms.value[index].users.findIndex(r => r._id === oldAdmin);
    loadedRooms.value[index].users[oldAdminIndex].role = 'GENERAL'

    const newAdminIndex = loadedRooms.value[index].users.findIndex(r => r._id === newAdmin);
    loadedRooms.value[index].users[newAdminIndex].role = 'ADMIN'

    loadedRooms.value[index].users = sortedUser(loadedRooms.value[index].users)
    loadedRooms.value = [...loadedRooms.value]

}

// 修改群组信息响应
const COMMAND_EDIT_GROUP_PROFILE_RESP = (data) => {
    const {roomId: changeRoomId, roomName, avatar} = data.data
    const index = loadedRooms.value.findIndex(r => r.roomId === changeRoomId);
    loadedRooms.value[index].roomName = roomName
    loadedRooms.value[index].avatar = avatar

    loadedRooms.value = [...loadedRooms.value]
}

// 删除群组信息响应
const COMMAND_MESSAGE_DELETE_RESP = (data) => {
    const {_id, roomId: messageRoomId, isLastMessage} = data.data
    if (messageRoomId === roomId.value) {
        const index = messages.value.findIndex(r => r._id === _id);
        if (index !== -1) {
            messages.value[index].deleted = true
            messages.value = [...messages.value]
        }
        if (isLastMessage) {
            const lastMessage = buildLastMessage(data.data)
            const roomIndex = loadedRooms.value.findIndex(r => r.roomId === messageRoomId);
            loadedRooms.value[roomIndex].lastMessage = lastMessage
            loadedRooms.value = [...loadedRooms.value]
        }

    }
}

// 已读消息响应
const COMMAND_MESSAGE_READ_RESP = (data) => {
    const {roomId: messageRoomId, messageId} = data.data

    if (messageRoomId === roomId.value) {
        const index = messages.value.findIndex(r => r._id === messageId);
        if (index !== -1) {
            messages.value[index].seen = true
            messages.value = [...messages.value]
        }
    }

    const index = loadedRooms.value.findIndex(r => r.roomId === messageRoomId);
    if (loadedRooms.value[index].lastMessage.messageId === messageId) {
        loadedRooms.value[index].lastMessage.seen = true
        loadedRooms.value = [...loadedRooms.value]
    }

}

// 全部人员列表
const COMMAND_USER_LIST_RESP = (data) => {
    waitSelectUser.value = data.data
}

// 用户配置响应
const COMMAND_USER_GROUP_CONFIG_RESP = (data) => {
    const {data: config} = data
    console.log(config)

    const index = loadedRooms.value.findIndex(r => r.roomId === config.roomId);
    if(index === -1){
         return
    }
    switch (config.type){
        case 'NOTICE':
            loadedRooms.value[index].notice = config.notice
            break;
    }

    loadedRooms.value = [...loadedRooms.value]

}

