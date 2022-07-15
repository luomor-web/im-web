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

    if (!process.env.IS_ELECTRON) return
    window.require('electron').ipcRenderer.send('ding')
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
