import {close, sendMsg} from "@/net/socket";

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
        ...data
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

// 创建一个好友会话群
const createGroup = (data) => {
    let param = {
        cmd: 22,
        isFriend: data.isFriend,
        avatar: data.avatar,
        users: data.users,
        roomName: data.roomName
    }
    sendMsg(param)
}

// 发送表情回复
const messageReaction = ({reaction, remove, messageId, roomId}) => {
    const param = {
        cmd: 28,
        reaction,
        remove,
        messageId,
        roomId
    }
    sendMsg(param)
}

// 修改用户资料
const editProfile = ({roomId, isGroup, avatar, name}) => {
    const param = {
        cmd: 30,
        isGroup,
        avatar,
        name,
        roomId
    }
    sendMsg(param)
}

// 邀请加入群聊
const joinUserGroup = ({group, users}) => {
    const param = {
        cmd: 7,
        group,
        users
    }
    sendMsg(param)
}

// 移出群聊 和 退出群聊
const removeUserGroup = ({roomId, userId, type}) => {
    const param = {
        cmd: 32,
        roomId,
        userId,
        type
    }
    sendMsg(param)
}


// 移交群主
const handoverUserGroup = ({roomId, userId}) => {
    const param = {
        cmd: 40,
        roomId,
        userId
    }
    sendMsg(param)
}

// 解散群聊
const disbandGroup = ({roomId}) => {
    const param = {
        cmd: 38,
        roomId
    }
    sendMsg(param)
}

// 请求历史文件消息
const messageFileHistory = ({roomId, date}) => {
    const param = {
        cmd: 34,
        roomId,
        date
    }
    sendMsg(param)
}

// 请求历史消息
const messageHistory = ({roomId, page, number}) => {
    const param = {
        cmd: 36,
        roomId,
        page,
        number
    }
    sendMsg(param)
}

// 修改群组信息
const editGroupProfile = ({roomId, roomName, avatar}) => {
  const param = {
      cmd: 42,
      roomId,
      roomName,
      avatar
  }
  sendMsg(param)
}

const quitSystem = () => {
    close()
}

// 构建最后一条消息
const buildLastMessage = (data) => {
    return {
        content: data.content,
        senderId: data.senderId,
        username: data.username,
        timestamp: data.timestamp,
        // saved: true,
        // distributed: true,
    }
}

export {
    handoverUserGroup,
    disbandGroup,
    getUserInfo,
    getHistoryMessage,
    clearUnReadMessage,
    sendChatMessage,
    getUserList,
    buildLastMessage,
    createGroup,
    quitSystem,
    messageReaction,
    editProfile,
    joinUserGroup,
    removeUserGroup,
    messageFileHistory,
    messageHistory,
    editGroupProfile
}
