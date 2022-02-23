import WebsocketHeartbeatJs from 'websocket-heartbeat-js'
import msg from '../plugins/msg'
import localStoreUtil, {getValue} from "@/utils/local-store";
import router from "@/router";

let socket

const webSocket = (username, password) => {
    // const socketUrl = process.env.VUE_APP_SOCKET_URL

    const protocol = location.protocol
    const port = location.port
    const host = location.host
    const socketUrl = protocol + "//" + host + (port === '' ? '' : ':') + port + "/ws"
    socket = new WebsocketHeartbeatJs({
        url: socketUrl + '?account=' + username + '&password=' + password,
        pingMsg: '{"cmd":13,"hbbyte":"-127"}', pingTimeout: 40000
    })
    socket.onopen = () => {
        // websocketHeartbeatJs.send('{"code":REDAY}')
    }
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        switch (data.command) {
            // 登录返回信息
            case 6:
                msg.$emit("COMMAND_LOGIN_RESP", data)
                break
            // 加入群组通知
            case 9:
                msg.$emit("COMMAND_JOIN_GROUP_NOTIFY_RESP", data)
                break;
            // 聊天请求
            case 11:
                msg.$emit("COMMAND_CHAT_RESP", data)
                break;
            // 心跳响应
            case 13:
                msg.$emit("COMMAND_HEARTBEAT_RESP", data)
                break;
            // 获取用户信息相应
            case 18:
                msg.$emit("COMMAND_GET_USER_RESP", data)
                break;
            // 获取历史消息
            case 20:
                msg.$emit("COMMAND_GET_MESSAGE_RESP", data)
                break;
            // 用户上下线消息
            case 21:
                msg.$emit("COMMAND_USER_STATUS_RESP", data)
                break
            // 群组创建成功 (暂不关注)
            case 23:
                msg.$emit("COMMAND_CREATE_GROUP_RESP", data)
                break
            // 消息已读响应
            case 25:
                msg.$emit("COMMAND_MESSAGE_READ_RESP", data)
                break;
            // 当前用户列表
            case 27:
                msg.$emit("COMMAND_USER_LIST_RESP", data)
                break;
            // 表情回复消息
            case 29:
                msg.$emit("COMMAND_SEND_MESSAGE_REACTION_RESP", data)
                break;
            // 修改信息返回
            case 31:
                msg.$emit("COMMAND_EDIT_PROFILE_REST", data)
                break;
            // 群组移除用户返回
            case 33:
                msg.$emit("COMMAND_REMOVE_GROUP_USER_RESP", data)
                break;
            // 获取历史文件响应
            case 35:
                msg.$emit("COMMAND_MESSAGE_FILE_HISTORY_RESP", data)
                break;
            // 获取历史消息响应
            case 37:
                msg.$emit("COMMAND_MESSAGE_HISTORY_RESP", data)
                break;
            // 解散群聊响应
            case 39:
                msg.$emit("COMMAND_DISBAND_GROUP_RESP", data)
                break;
            // 移交群主响应
            case 41:
                msg.$emit("COMMAND_HANDOVER_GROUP_RESP", data)
                break;
            // 修改群组信息响应
            case 43:
                msg.$emit("COMMAND_EDIT_GROUP_PROFILE_RESP", data)
                break;
            // 删除信息响应
            case 45:
                msg.$emit("COMMAND_MESSAGE_DELETE_RESP", data)
                break;
            // 删除信息响应
            case 49:
                msg.$emit("COMMAND_SEARCH_MESSAGE_RESP", data)
                break;
            // 系统消息会话消息
            case 51:
                msg.$emit("COMMAND_SYSTEM_MESSAGE_RESP", data)
                break;
            // 群组配置修改
            case 53:
                msg.$emit("COMMAND_USER_GROUP_CONFIG_RESP", data)
                break;
            // 音视频通话消息
            case 56:
                msg.$emit("COMMAND_VIDEO_RESP", data)
                break;
            default:
                break
        }
    }
    socket.onclose = () => {
        localStoreUtil.removeKey('userId')
        localStoreUtil.removeKey('token')
        router.push('/Login')
    }
    socket.onreconnect = () => {
        msg.$emit("RECONNECTING")
    }

    socket.onerror = () => {
    }
}

const close = () => {
    socket.heartReset()
    socket.close()
}

const sendMsg = (data) => {
    try {
        socket.send(JSON.stringify(data))
    } catch (e) {
        initWebSocket()
    }

}

const initWebSocket = () => {
    const username = getValue('username')
    const password = getValue('password')
    if (username === '' || username === undefined || username === null) {
        if (socket) {
            try {
                socket.close()
            } catch (e) {
                console.error(e)
            }
        }
        localStoreUtil.clear()
        router.push('/login')
    }
    const token = localStoreUtil.getValue('token');
    if (token === '' || token === undefined || token === null) {
        return
    }
    if (socket == null && username) {
        webSocket(username, password)
    }
}

const startWebSocket = (username, password) => {
    if (socket) {
        close()
    }
    webSocket(username, password)
}

export {webSocket, close, sendMsg, initWebSocket, startWebSocket, socket}
