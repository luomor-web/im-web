import {close, sendMsg} from "@/net/socket";
import {buildDisplayTime} from "@/utils/date-util";

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
const editProfile = ({userId, avatar, name}) => {
    const param = {
        cmd: 30,
        avatar,
        name,
        userId
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

// 移出群聊 和 退出群聊
const setAdmin = ({roomId, userId, type}) => {
    const param = {
        cmd: 46,
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

// 撤回消息
const messageDelete = ({messageId}) => {
    const param = {
        cmd: 44,
        messageId
    }
    sendMsg(param)
}

// 搜索聊天记录
const searchMessage = ({content,roomId}) => {
    const param = {
        cmd: 48,
        content,
        roomId
    }
    sendMsg(param)
}



// 群组配置
const userGroupConfig = (data) => {
    const param = {
        cmd: 52,
        ...data
    }
    sendMsg(param)
}

// 发起视频
const callVideo = (data) =>{
    const param = {
        cmd:55,
        ...data
    }
    sendMsg(param)
}

const quitSystem = () => {
    close()
}

// 构建最后一条消息
const buildLastMessage = (data) => {
    let content = data.deleted ?  '删除了一条消息' : data.content
    if (!data.content && data.files.length > 0) {
        content += ("[文件] - " + data.files[0].name)
        content += (data.files.length === 1 ? '' : '等多个文件')
    }

    return buildLastMessageTime({
        messageId: data._id,
        content: content,
        senderId: data.senderId,
        username: data.system ? '' : data.username,
        timestamp: data.timestamp,
        date: data.date,
        saved: data.saved,
        distributed: data.distributed,
        seen: data.seen,
        indexId: data.sendTime
    })
}

// 构建最后一条消息时间
const buildLastMessageTime = (lastMessage) => {
    if (lastMessage?.date) {
        lastMessage.timestamp = buildDisplayTime(lastMessage.date,lastMessage.timestamp)
    }

    return lastMessage
}

export {
    callVideo,
    searchMessage,
    setAdmin,
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
    editGroupProfile,
    messageDelete,
    buildLastMessageTime,
    userGroupConfig
}
