import {sendMsg} from "@/net/socket";

const getUserInfo = (data) => {
    // 发送获取用户信息
    let param = {
        cmd: 17,
        userId: data,
    }
    sendMsg(param)
}

// 获取历史消息
const getHistoryMessage = (data) => {
    let param = {
        cmd: 19,
        roomId: data
    }
    sendMsg(param)
}

// 清空未读消息
const clearUnReadMessage = (data) => {
    let param = {
        cmd: 24,
        roomId: data
    }
    sendMsg(param)
}

// 发送聊天消息
const sendChatMessage = (data) => {
    let param = {
        cmd: 11,
        ...data
    }
    sendMsg(param)
}

// 获取所有用户
const getUserList = () => {
    let param = {
        cmd: 26,
    }
    sendMsg(param)
}

// 构建最后一条消息
const buildLastMessage = (data) => {
    return {
        content :data.content,
        senderId : data.senderId,
        username: data.username,
        timestamp: data.timestamp,
        // saved: true,
        // distributed: true,
    }
}

export {
    getUserInfo,
    getHistoryMessage,
    clearUnReadMessage,
    sendChatMessage,
    getUserList,
    buildLastMessage
}
