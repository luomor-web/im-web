// 已加载的房间列表
import {ref} from "@vue/composition-api";
import {clearUnReadMessage, getHistoryMessage} from "@/net/send-message";
import {scrollToView} from "@/utils/dom";

// 当前用户ID
export const currentUserId = ref('')
// 已加载完成的房间列表
export const loadedRooms = ref([])
// 当前用户
export const curUser = ref({_id: ''})
// 加载动画
export const loadingRooms = ref(false)
// 房间列表是否加载完成
export const roomsLoaded = ref(true)
// 当前消息列表
export const messages = ref([])
// 消息是否加载完成
export const messageLoaded = ref(false)
// 是否开启消息搜索模式
export const searchMessage = ref(false)
// 当前房间ID
export const roomId = ref('')
// 等待发送的消息
export const waitSendMessage = ref([])
// 系统全部人员列表
export const waitSelectUser = ref([])

export const setCurUser = user => {
    curUser.value = {...user}
}

// 重新定位房间
export const changeRoom = item => {
    messages.value = messages.value.splice(0, messages.value.length)
    messages.value = []

    const filter = waitSendMessage.value.filter(x => x.roomId === item);
    filter.forEach(x => {
        messages.value.push(x)
    })

    messageLoaded.value = false
    searchMessage.value = false
    roomId.value = item
    const roomIndex = loadedRooms.value.findIndex(r => item === r.roomId)
    loadedRooms.value[roomIndex].users = sortedUser(loadedRooms.value[roomIndex].users)
    loadedRooms.value[roomIndex].users = [...loadedRooms.value[roomIndex].users]
    loadedRooms.value[roomIndex].unreadCount = 0;
    loadedRooms.value = [...loadedRooms.value]

    getHistoryMessage({roomId: roomId.value})
    clearUnReadMessage(roomId.value)
}

// 房间升级
export const upRoom = (roomId) => {
    const roomIndex = loadedRooms.value.findIndex(r => roomId === r.roomId)
    if (roomIndex === -1) {
        return
    }
    loadedRooms.value[roomIndex].index = new Date().getTime()
    loadedRooms.value = [...loadedRooms.value]
}

// 开启搜索模式
export const startHistoryMessage = (item) => {
    searchMessage.value = true
    console.log('lastMessage', messages.value[messages.value.length - 1].indexId || messages.value[messages.value.length - 1]._id)
    messages.value = []
    messages.value.push(item)
    messages.value = [...messages.value]

    setTimeout(() => {
        const element = document.getElementById(item._id);
        if (element) {
            scrollToView(element)
        }
    }, 1000)
}

// 点击右下角图标,关闭角标
export const clickScrollIcon = ({roomId}) => {
    console.log(roomId)
    setTimeout(() => {
        messages.value = []
    })
    getHistoryMessage({roomId: roomId, returnDefault: true})
}

// 提示音
export const ding = () => {
    let audio = document.querySelector("#audio1");
    if (!audio) {
        audio = document.createElement("audio");
        audio.id = "audio1";
        let source = document.createElement("source");
        source.src = require('@/assets/music/tip.mp3')
        source.className = 'd-none'
        source.type = "audio/mpeg";
        audio.append(source);
        document.body.append(audio);
    }
    const aid = document.querySelector("#audio1");
    aid.load();
    let timer = setTimeout(() => {
        clearTimeout(timer);
        aid.play();
    }, 200);
}

export const sortedUser = (users) => {
    return users.sort((x, y) => {
        // 群主位于第一位, 无视状态
        if (x.role === 'ADMIN' || y.role === 'ADMIN') {
            return x.role === 'ADMIN' ? -1 : 1
            // 如果两个角色相等 判断在线状态
        } else if (x.role === 'SUB_ADMIN' || y.role === 'SUB_ADMIN') {
            return x.role === 'SUB_ADMIN' ? -1 : 1
        } else if (x.role === y.role) {
            // 在线的优先于不在线的
            if (x.status.state !== y.status.state) {
                return x.status.state === 'online' ? -1 : 1
            } else {
                return x.username.localeCompare(y.username, 'zh')
            }
        }
    })
}
