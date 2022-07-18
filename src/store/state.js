export default {
    // 当前房间编号
    roomId: '',
    // 当前用户
    curUser: {_id: ''},
    // 当前用户ID
    currentUserId: '',
    // 已加载完成的房间列表
    loadedRooms: [],
    // 消息是否加载完成
    messageLoaded : false,
    // 是否开启消息搜索模式
    searchMessage: false,
    // 房间列表是否加载完成
    roomsLoaded: true,
    // 加载动画
    loadingRooms :false,
    // 当前消息列表
    messages: [],
    // 等待发送的消息
    waitSendMessage: [],
    // 全局定时器
    timers: Object.create(null),
    // 信息窗格（右侧）
    informationPane : '',
    // 设置窗格（左侧）
    settingPane : '',
    // 下载列表
    downloadItemList: [],
    // 自动下载
    autoDownload: false,
    // 默认下载位置
    downloadPath: ''
}
