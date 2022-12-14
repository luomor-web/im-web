import { close, sendMsg } from '@/net/socket'
import { buildDisplayTime } from '@/utils/date-util'
import store from '@/store'

const getUserInfo = (data) => {
  // 发送获取用户信息
  const param = {
    cmd: 17,
    userId: data
  }
  sendMsg(param)
}

// 获取历史消息
const getHistoryMessage = (data) => {
  const param = {
    cmd: 19,
    ...data
  }
  sendMsg(param)
}

// 清空未读消息
const clearUnReadMessage = (data) => {
  const param = {
    cmd: 24,
    roomId: data
  }
  sendMsg(param)
}

// 发送聊天消息
const sendChatMessage = (data) => {
  const param = {
    cmd: 11,
    ...data
  }
  sendMsg(param)
}

// 获取所有用户
const searchUser = (name, userId, searchId) => {
  const param = {
    cmd: 26,
    name,
userId,
searchId
  }
  sendMsg(param)
}

// 获取所有公开群组
const searchGroup = (name, roomId, searchId) => {
  const param = {
    cmd: 63,
    name,
    roomId,
    searchId
  }
  sendMsg(param)
}

// 创建一个好友会话群
const createGroup = (data) => {
  const param = {
    cmd: 22,
    ...data
  }
  sendMsg(param)
}

// 发送表情回复
const messageReaction = ({ reaction, remove, messageId, roomId }) => {
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
const editProfile = ({ userId, avatar, name }) => {
  const param = {
    cmd: 30,
    avatar,
    name,
    userId
  }
  sendMsg(param)
}

// 邀请加入群聊
const joinUserGroup = ({ group, users }) => {
  const param = {
    cmd: 7,
    group,
    users
  }
  sendMsg(param)
}

// 移出群聊 和 退出群聊
const removeUserGroup = ({ roomId, userId, type }) => {
  const param = {
    cmd: 32,
    roomId,
    userId,
    type
  }
  sendMsg(param)
}

// 移出群聊 和 退出群聊
const setAdmin = ({ roomId, userId, type }) => {
  const param = {
    cmd: 46,
    roomId,
    userId,
    type
  }
  sendMsg(param)
}

// 移交群主
const handoverUserGroup = ({ roomId, userId }) => {
  const param = {
    cmd: 40,
    roomId,
    userId
  }
  sendMsg(param)
}

// 解散群聊
const disbandGroup = ({ roomId }) => {
  const param = {
    cmd: 38,
    roomId
  }
  sendMsg(param)
}

// 修改群组信息
const editGroupProfile = ({ roomId, roomName, avatar }) => {
  const param = {
    cmd: 42,
    roomId,
    roomName,
    avatar
  }
  sendMsg(param)
}

// 撤回消息
const messageDelete = ({ messageId }) => {
  const param = {
    cmd: 44,
    messageId
  }
  sendMsg(param)
}

// 搜索聊天记录
const searchMessage = (data) => {
  const param = {
    cmd: 48,
    ...data
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
const callVideo = (data) => {
  const param = {
    cmd: 55,
    ...data
  }
  sendMsg(param)
}

// 转发消息
const forwardMessage = (data) => {
  const param = {
    cmd: 34,
    ...data
  }
  sendMsg(param)
}

// 搜索表情包
const searchEmoticon = (data) => {
  const param = {
    cmd: 36,
    ...data
  }
  sendMsg(param)
}

// 获取自己的表情包
const searchUserEmoticon = (data) => {
  const param = {
    cmd: 57,
    ...data
  }
  sendMsg(param)
}

// 操作表情包
const operationEmoticon = (data) => {
  const param = {
    cmd: 59,
    ...data
  }
  sendMsg(param)
}

// 设置群组公开
const setPublicRoom = (data) => {
  const param = {
    cmd: 61,
    ...data
  }
  sendMsg(param)
}

// 设置群组公开
const commitAnnouncement = (data) => {
  const param = {
    cmd: 69,
    ...data
  }
  sendMsg(param)
}

const quitSystem = () => {
  store.commit('resetData')
  close()
}

// 获取所有公开群组
const setNewPassword = (data) => {
  const param = {
    cmd: 65,
    ...data
  }
  sendMsg(param)
}

// 构建最后一条消息
const buildLastMessage = (data) => {
  let content = data.deleted ? '删除了一条消息' : data.content
  if (!data.content && data.files?.length === 1 && !data.deleted && data.files[0].isEmoticon) {
    content += '[表情包]'
  }
  if (!data.content && data.files?.length > 0 && !data.deleted && !data.files[0].isEmoticon) {
    content += ('[文件] - ' + data.files[0].name)
    content += (data.files.length === 1 ? '' : '等多个文件')
  }

  return buildLastMessageTime({
    messageId: data._id,
    content,
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
    lastMessage.timestamp = buildDisplayTime(lastMessage.date, lastMessage.timestamp)
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
  searchUser,
  buildLastMessage,
  createGroup,
  quitSystem,
  messageReaction,
  forwardMessage,
  editProfile,
  joinUserGroup,
  removeUserGroup,
  editGroupProfile,
  messageDelete,
  buildLastMessageTime,
  userGroupConfig,
  searchEmoticon,
  operationEmoticon,
  searchUserEmoticon,
  setPublicRoom,
  searchGroup,
  setNewPassword,
  commitAnnouncement
}
