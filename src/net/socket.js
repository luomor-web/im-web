import WebsocketHeartbeatJs from 'websocket-heartbeat-js'
import msg from '../plugins/msg'
import sessionStoreUtil from "@/utils/session-store";
import router from "@/router";
import store from "@/store";

let socket

const webSocket = (token) => {
    const socketUrl = process.env.VUE_APP_SOCKET_URL + "/ws"

    // const protocol = location.protocol
    // const port = location.port
    // const host = location.host
    socket = new WebsocketHeartbeatJs({
        url: socketUrl + '?token=' + token,
        pingMsg: '{"cmd":13,"hbbyte":"-127"}', pingTimeout: 6000, pongTimeout:6000
    })
    socket.onopen = () => {
        msg.$emit("SOCKET_CONNECTING")
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
                store.commit("COMMAND_JOIN_GROUP_NOTIFY_RESP", data)
                break;
            // 聊天请求
            case 11:
                store.commit("COMMAND_CHAT_RESP", data)
                break;
            // 心跳响应
            case 13:
                // store.commit("COMMAND_HEARTBEAT_RESP", data)
                break;
            // 获取用户信息相应
            case 18:
                store.commit("COMMAND_GET_USER_RESP", data)
                break;
            // 获取历史消息
            case 20:
                store.commit("COMMAND_GET_MESSAGE_RESP", data)
                break;
            // 用户上下线消息
            case 21:
                store.commit("COMMAND_USER_STATUS_RESP", data)
                break
            // 群组创建成功 (暂不关注)
            case 23:
                store.commit("COMMAND_CREATE_GROUP_RESP", data)
                break
            // 消息已读响应
            case 25:
                store.commit("COMMAND_MESSAGE_READ_RESP", data)
                break;
            // 当前用户列表
            case 27:
                msg.$emit("COMMAND_SEARCH_USER_RESP", data)
                break;
            // 表情回复消息
            case 29:
                store.commit("COMMAND_SEND_MESSAGE_REACTION_RESP", data)
                break;
            // 修改信息返回
            case 31:
                store.commit('COMMAND_EDIT_PROFILE_REST', data)
                break;
            // 群组移除用户返回
            case 33:
                store.commit("COMMAND_REMOVE_GROUP_USER_RESP", data)
                break;
            // 解散群聊响应
            case 39:
                store.commit("COMMAND_DISBAND_GROUP_RESP", data)
                break;
            // 移交群主响应
            case 41:
                store.commit("COMMAND_HANDOVER_GROUP_RESP", data)
                break;
            // 修改群组信息响应
            case 43:
                store.commit("COMMAND_EDIT_GROUP_PROFILE_RESP", data)
                break;
            // 删除信息响应
            case 45:
                store.commit("COMMAND_MESSAGE_DELETE_RESP", data)
                break;
            // 删除信息响应
            case 49:
                msg.$emit("COMMAND_SEARCH_MESSAGE_RESP", data)
                break;
            // 系统消息会话消息
            case 51:
                store.commit("COMMAND_SYSTEM_MESSAGE_RESP", data)
                break;
            // 群组配置修改
            case 53:
                store.commit("COMMAND_USER_GROUP_CONFIG_RESP", data)
                break;
            // 音视频通话消息
            case 56:
                store.commit("COMMAND_VIDEO_RESP", data)
                break;
            default:
                break
        }
    }
    socket.onclose = () => {
    }
    socket.onreconnect = () => {
        msg.$emit("SOCKET_RECONNECTING")
    }

    socket.onerror = () => {
    }
}

const close = () => {
    sessionStoreUtil.removeKey('token')
    socket.heartReset()
    socket.close()
    socket = null
    router.push('/Login').then(() => {})
}

const sendMsg = (data) => {
    try {
        socket.send(JSON.stringify(data))
    } catch (e) {
        initWebSocket()
    }
}

const initWebSocket = () => {
    // const username = getValue('username')
    // const password = getValue('password')

    const token = sessionStoreUtil.getValue('token')
    if (token === '' || token === undefined || token === null) {
        if (socket) {
            try {
                socket.close()
            } catch (e) {
                console.error(e)
            }
        }
        // localStoreUtil.clear()
        router.push('/login').then(() => {})
    }

    if (socket == null && token) {
        webSocket(token)
    }
}

const startWebSocket = (token) => {
    if (socket) {
        socket.close()
    }
    webSocket(token)
}

export {webSocket, close, sendMsg, initWebSocket, startWebSocket, socket}
