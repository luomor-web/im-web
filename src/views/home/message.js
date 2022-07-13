import {changeRoom, currentUserId, curUser, messages, roomId, timers, upRoom, waitSendMessage} from "@/views/home/home";
import {getHistoryMessage, messageReaction, sendChatMessage} from "@/net/send-message";
import {uuid} from "@/utils/id-util";
import moment from "moment";
import {uploadFiles} from "@/utils/upload";

export const sendMessageReaction = ({reaction, remove, messageId, roomId}) => {
    messageReaction({reaction: reaction.unicode, remove, messageId, roomId})
}

// 查找更多消息
export const fetchMessage = ({room, options = {}}) => {
    if (options.reset && room.roomId !== roomId.value) {
        console.log(options.reset, '222')
        changeRoom(room.roomId)
        return
    }
    // 向下刷
    if (options.type === 'down') {
        getHistoryMessage({
            roomId: roomId.value, type: options.type, messageId: messages.value[messages.value.length - 1]?._id
        })
    } else {
        getHistoryMessage({roomId: roomId.value, type: options.type, messageId: messages.value[0]?._id})
    }
}

export const sendMessage = async ({content, roomId, files, replyMessage}) => {
    // 如果发送了文件, 那么给每一个文件生成一个ID
    files?.forEach(x => {
        x.id = uuid()
        x.url = x.localUrl
    })

    const message = {
        senderId: currentUserId.value, content, roomId, replyMessage: replyMessage, files: files
    }

    // 如果存在文件, 则把文件加入到上传列表,等待上传完毕后发送

    // 构建消息, 添加到消息列表中
    message._id = uuid()
    message.system = false
    message.date = moment().format("YYYY-MM-DD")
    message.username = curUser.value.username
    message.avatar = curUser.value.avatar
    message.timestamp = '...'

    upRoom(roomId)

    await operationMessage(message)

}

export const openFailedMessage = async ({ message}) => {
    removeWaitSendMessage(message._id)
    const index = messages.value.findIndex(x => x._id === message._id);
    if(index !== -1) {
        messages.value.splice(index,1)
        messages.value = [...messages.value]
    }
    message.failure = false
    await operationMessage(message)
}


const sendFileMessage = (file, roomId, isLast) => {
    const index = waitSendMessage.value.findIndex(r => r.roomId === roomId)
    if (index === -1) return

    const fileIndex = waitSendMessage.value[index].files.findIndex(f => f.id === file.id);
    if (fileIndex === -1) return

    waitSendMessage.value[index].files[fileIndex] = file
    if (!isLast) return

    sendChatMessage(waitSendMessage.value[index])

    // waitSendMessage.value.splice(index, 1)
}

const operationMessage = async message => {

    messages.value.push(message)

    addWaitSendMessage(message)

    if (!message.files) {
        sendChatMessage(message)
        return
    }

    await uploadFiles(message.files, (file, isOver) => {
        if (file.progress) {
            updateProgress(file, message._id)
            return
        }

        sendFileMessage({
            id: file.id,
            name: file.name + (file.extension ? '.' : '') + file.extension,
            size: file.size,
            type: file.type,
            url: file.url,
            progress: file.progress
        }, message.roomId, isOver)
        // 捕获发送过程中的异常, 消息发送失败处理
    }).catch(() => {
        handleFailMessage(message._id)
    })
}

const handleFailMessage = (messageId) => {
    const message = messages.value.find(r => r._id === messageId);
    if (!message) return
    message.failure = true
    message.files?.forEach(x => x.progress = -1)
    messages.value = [...messages.value]

    setWaitSendMessageFail(messageId)

    const t = timers.value.get(messageId);
    if (t) {
        clearTimeout(t)
    }
    timers.value.delete(messageId)
}

const updateProgress = (file, messageId) => {
    const message = messages.value.find(r => r._id === messageId);
    if (!message || !message.files) return

    message.files.find(r => r.id === file.id).progress = file.progress
    messages.value = [...messages.value]
}

const addWaitSendMessage = (message) => {
    waitSendMessage.value.push(message)
    const t = setTimeout(() => {
        handleFailMessage(message._id)
    }, 12000);
    timers.value.set(message._id, t)
    console.log(timers.value)
}

export const removeWaitSendMessage = (messageId) => {
    const waitIndex = waitSendMessage.value.findIndex(r => r._id === messageId)
    if (waitIndex !== -1) {
        waitSendMessage.value.splice(waitIndex, 1)
    }
    const t = timers.value.get(messageId);
    if (t) {
        clearTimeout(t)
    }
    timers.value.delete(messageId)
}

const setWaitSendMessageFail = (messageId) => {
    const waitIndex = waitSendMessage.value.findIndex(r => r._id === messageId)
    if (waitIndex !== -1) {
        waitSendMessage.value[waitIndex].failure = true
    }
    waitSendMessage.value = [...waitSendMessage.value]
}
