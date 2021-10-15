import WebsocketHeartbeatJs from 'websocket-heartbeat-js'
import msg from '../plugins/msg'
import {getValue} from "@/utils/localStoreUtil";
import router from "@/router";

let socket

const webSocket = (username, password) => {
    socket = new WebsocketHeartbeatJs({
        url: 'ws://127.0.0.1:9326?account=' + username + '&password=' + password,
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
            // 群组创建成功
            case 23:
                msg.$emit("COMMAND_CREATE_GROUP_RESP", data)
                break
            // 消息已读响应
            case 25:
                msg.$emit("COMMAND_MESSAGE_READ_RESP", data)
                break;
            // 当前用户列表
            case 27:
                msg.$emit("COMMAND_USER_LIST_RESP",data)
                break;
            default:
                break
        }
    }
    socket.onclose = () => {
        localStorage.clear()
        router.push('/Login')
    }
    socket.onreconnect = () => {
        console.log('reconnecting...')
    }

    socket.onerror = () => {
        console.log('error')
    }
}

const close = () => {
    socket.heartReset()
    socket.close()
}

const sendMsg = (data) => {
    socket.send(JSON.stringify(data))
}

const initWebSocket = () => {
    const username = getValue('username')
    if (!socket && username != null) {
        webSocket(username, 'a')
    }
}

export {webSocket, close, sendMsg, initWebSocket, socket}
