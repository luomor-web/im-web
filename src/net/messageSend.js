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

const sendChatMessage = (data) => {
    let param = {
        cmd: 11,
        ...data
    }
    sendMsg(param)
}

export {
    getUserInfo,
    getHistoryMessage,
    clearUnReadMessage,
    sendChatMessage
}
