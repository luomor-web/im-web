import {changeRoom, currentUserId, curUser, messages, roomId, upRoom, waitSendMessage} from "@/views/home/home";
import {getHistoryMessage, messageReaction, sendChatMessage} from "@/net/send-message";
import {addFiles} from "@/utils/file";
import {uuid} from "@/utils/id-util";
import moment from "moment";

export const sendMessageReaction = ({reaction, remove, messageId, roomId}) => {
    messageReaction({reaction: reaction.unicode, remove, messageId, roomId})
}

// 查找更多消息
export const fetchMessage = ({room, options = {}}) => {
    if (options.reset && room.roomId !== roomId.value) {
        console.log(options.reset,'222')
        changeRoom(room.roomId)
        return
    }
    // 向下刷
    if (options.type === 'down') {
        getHistoryMessage({roomId: roomId.value, type: options.type, messageId: messages.value[messages.value.length - 1]?._id})
    } else {
        getHistoryMessage({roomId: roomId.value, type: options.type, messageId: messages.value[0]?._id})
    }
    // if (page.value === sendPage.value) return

    // sendPage.value = page.value
    // getHistoryMessage({roomId: roomId.value, page: page.value, number: number.value})
}

export const sendMessage = async ({content, roomId, files, replyMessage}) => {
    // 如果发送了文件, 那么给每一个文件生成一个ID
    files?.forEach(x => {
        x.id = uuid()
        x.url = x.localUrl
    })

    const message = {
        senderId: currentUserId.value,
        content,
        roomId,
        replyMessage: replyMessage,
        files: files
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
    waitSendMessage.value.push(message)

    if (!message.files) {
        sendChatMessage(message)
        return
    }

    await addFiles(message.files, (file, isOver) => {

        if (file.progress) {
            updateProgress(file, message._id)
            return
        }

        sendFileMessage({
            id: file.id,
            name: file.name + '.' + file.extension,
            size: file.size,
            type: file.type,
            url: file.url,
            progress: file.progress
        }, message.roomId, isOver)

    })
}

const updateProgress = (file, messageId) => {
    const message = messages.value.find(r => r._id === messageId);
    if (!message || !message.files) return

    message.files.find(r => r.id === file.id).progress = file.progress
    messages.value = [...messages.value]
}

