// 已加载的房间列表
import {ref} from "@vue/composition-api";
import {clearUnReadMessage, getHistoryMessage} from "@/net/message";

// 当前用户ID
export const currentUserId = ref('')
// 已加载完成的房间列表
export const loadedRooms = ref([])
// 当前用户
export const curUser = ref({})
// 加载动画
export const loadingRooms = ref(false)
// 房间列表是否加载完成
export const roomsLoaded = ref(true)
// 当前消息列表
export const messages = ref([])
// 消息是否加载完成
export const messageLoaded = ref(false)
// 当前消息页数
export const page = ref(0)
export const sendPage = ref(-1)
// 当前消息分页数
export const number = ref(20)
// 当前房间ID
export const roomId = ref('')
// 等待发送的消息
export const waitSendMessage = ref([])

export const changeRoom = item => {
    messages.value = messages.value.splice(0, messages.value.length)
    messages.value = []

    const filter = waitSendMessage.value.filter(x => x.roomId === item);
    filter.forEach(x => {
        messages.value.push(x)
    })

    messageLoaded.value = false
    page.value = 0
    sendPage.value = 0
    roomId.value = item
    const roomIndex = loadedRooms.value.findIndex(r => item === r.roomId)
    loadedRooms.value[roomIndex].users = sortedUser(loadedRooms.value[roomIndex].users)
    loadedRooms.value[roomIndex].users = [...loadedRooms.value[roomIndex].users]
    loadedRooms.value[roomIndex].unreadCount = 0;
    loadedRooms.value = [...loadedRooms.value]

    getHistoryMessage({roomId: roomId.value, page: page.value, number: number.value})
    clearUnReadMessage(roomId.value)
}

export const upRoom = (roomId) => {
    const roomIndex = loadedRooms.value.findIndex(r => roomId === r.roomId)
    if (roomIndex === -1) {
        return
    }
    loadedRooms.value[roomIndex].index = new Date().getTime()
    loadedRooms.value = [...loadedRooms.value]
}

export const ding = () => {
    const element = document.getElementById('audio');
    element.currentTime = 0
    element.play()
}

export const sortedUser = (users) => {
    return users.sort((x, y) => {
        // 如果是群主，优先在最前面
        if (x.role === 'ADMIN' || y.role === 'ADMIN') {
            return x.role === 'ADMIN' ? -1 : 1
            // 如果两个角色相等 判断在线状态
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
