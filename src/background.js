'use strict'
import { app, BrowserWindow, ipcMain, Menu, protocol, screen, Tray } from 'electron'
import createProtocol from './service/createProtocol'
import { updateHandle } from '@/service/updateHandler'
import { initMenu } from '@/service/menuHandler'
import { downloadHandle } from '@/service/downloadHandler'
import log from 'electron-log'

const resources = process.resourcesPath

const path = require('path')
export let version = ''
export const isDevelopment = process.env.NODE_ENV !== 'production'
export let win
const ex = process.execPath

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  win = new BrowserWindow({
    show: false,
    width: 1300,
    height: 765,
    useContentSize: true,
    frame: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // 开发环境打开控制台
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL).then(() => {
      if (isDevelopment) win.webContents.toggleDevTools()
    })
  } else {
    createProtocol('app', path.join(resources, './app.asar.unpacked'))
    win.loadURL('app://./index.html').then(() => {})
  }
  win.on('closed', () => {
    win = null
  })

  win.on('ready-to-show', function () {
    win.show() // 初始化后再显示
  })

  win.on('focus', onWindowFocus)
}

app.commandLine.appendSwitch('ignore-certificate-errors') // 忽略证书的检测

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS, it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS, it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

app.on('ready', async () => {
  createWindow()
  bindTray()
  updateHandle()
  downloadHandle()
  msgWindowHandler.createWindow()
})

ipcMain.on('min', () => win.minimize())

ipcMain.on('max', () => win.isMaximized() ? win.unmaximize() : win.maximize())

ipcMain.on('close', () => {
  hideWindow()
})

ipcMain.on('quit', () => {
  app.quit()
})

ipcMain.on('open-auto-start', (event, args) => {
  if (args && isDevelopment) {
    return
  }
  app.setLoginItemSettings({
    openAtLogin: args,
    path: ex,
    args: []
  })
})

ipcMain.handle('win-version', (event, v) => {
  version = v
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// 注册快捷键
initMenu()

let msgWindow
export let notifyList = []
ipcMain.on('notify-list', (event, room) => {

  if (win.isFocused()) {
    clearNotifyList()
    return
  }
  const index = notifyList.findIndex(x => x.roomId === room.roomId)
  if (index !== -1) {
    notifyList.splice(index, 1)
    if (room.unreadCount === 0) {
      return
    }
  }
  if (index === -1 && room.unreadCount === 0) return
  notifyList.unshift(room)
  msgWindow.webContents.send('notify-list', { room, action: 'add' })
})

ipcMain.on('focus-chat', (event, room) => {
  win.webContents.send('change-room', room.roomId)
  win.show()
  msgWindowHandler.hideWindow()
})

export const msgWindowHandler = {
  createWindow: () => {
    msgWindow = new BrowserWindow({
      frame: false,
      show: false,
      type: 'toolbar',
      alwaysOnTop: true,
      // resizable: false,
      focusable: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true
      }
    })
    msgWindow.setSkipTaskbar(false)
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // 开发环境打开控制台
      msgWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/#/notify').then(() => {
        // if (isDevelopment) msgWindow.webContents.toggleDevTools()
      })
    } else {
      createProtocol('app', path.join(resources, './app.asar.unpacked'))
      msgWindow.loadURL('app://./index.html#/notify').then(() => {})
    }
    msgWindow.on('close', () => {
      msgWindow = null
    })
  },

  hideWindow: () => {
    if (msgWindow) {
      msgWindow.hide()
    }
  },

  showWindow: (x, y, count) => {
    const height = count <= 8 ? count * 48 : 8 * 48
    if (msgWindow) {
      msgWindow.setSize(220, height + 44)
      msgWindow.setPosition(x, y - (height + 44))
      msgWindow.setAlwaysOnTop(true, 'pop-up-menu')
      msgWindow.setOpacity(1)
      msgWindow.show()
    }
  }

}

export const showWindow = () => {
  win.setSkipTaskbar(false)
  win.show()
}

export const hideWindow = () => {
  win.setSkipTaskbar(true)
  win.hide()
}

// 通知栏和任务栏闪烁 ===============================
// 通知栏闪烁定时器
let trayNoticeInterval, position
// 绑定托盘
let iconPath, blankIconPath

export let appIcon

export const bindTray = () => {
  iconPath = path.join(__dirname, isDevelopment ? '../public/icons/tray.ico' : './icons/tray.ico')
  blankIconPath = path.join(__dirname, isDevelopment ? '../public/icons/black_tray.ico' : './icons/black_tray.ico')
  log.info('图标路径', iconPath)
  appIcon = new Tray(iconPath)
  appIcon.setContextMenu(Menu.buildFromTemplate([
    {
      label: '显示',
      click: function () {
        showWindow()
      }
    },
    {
      label: '退出',
      click: function () {
        if (trayNoticeInterval) {
          clearInterval(trayNoticeInterval)
          trayNoticeInterval = null
        }
        msgWindow.close()
        app.quit()
      }
    }
  ]))
  appIcon.setToolTip(isDevelopment ? '信使开发版' : '信使')
  appIcon.on('click', () => {
    showWindow()
  })
  appIcon.on('right-click', (event, position) => {
    console.log(event, position)
  })
  appIcon.on('mouse-move', (event, position) => {
    if (trayNoticeInterval) return
    mouseEnter()
  })
}

export const resetTrayIcon = () => {
  appIcon.setImage(iconPath)
  clearInterval(t)
  t = null
}

let count = 0
let t
export const startFlash = () => {
  if (t || win.isFocused()) return
  win.flashFrame(true)
  t = setInterval(function () {
    if (count++ % 2 === 0) {
      appIcon.setImage(iconPath)
    } else {
      appIcon.setImage(blankIconPath)
    }
  }, 600)
}

// 鼠标进入托盘,离开托盘事件======================
const mouseEnter = () => {
  const bounds = appIcon.getBounds()
  if (notifyList.length > 0) {
    msgWindowHandler.showWindow(bounds.x - 110, bounds.y, notifyList.length)
  }
  trayNoticeInterval = setInterval(() => {
    position = screen.getCursorScreenPoint()
    const xl = bounds.x - 110
    const xr = bounds.x + 110
    const height = notifyList.length <= 8 ? notifyList.length * 48 : 8 * 48
    const yt = bounds.y - (height + 28 + 16)
    const yb = bounds.y
    const inTray = (bounds.x < position.x && bounds.y < position.y && position.x < (bounds.x + bounds.width) && position.y < (bounds.y + bounds.height))
    // 窗口 y = 图标位置Y - 通知高度
    // 窗口左 x = 图标位置x - 通知宽度 / 2
    // 窗口右 x = 图标位置x + 通知宽度 / 2
    // 鼠标所在位置的X轴大于窗口左侧 小于窗口右侧
    // console.log('当前鼠标位置', position.x, position.y, xl, xr, yt, yb)
    const inNotify = (position.x > xl && position.x < xr && position.y > yt && position.y < yb)
    // 如果不在范围内了
    if (!inTray && !inNotify) {
      clearInterval(trayNoticeInterval)
      trayNoticeInterval = null
      // log.info('mouseOut')
      msgWindowHandler.hideWindow()
    }
  }, 100)
}

ipcMain.on('ding', () => {
  startFlash()
})

const onWindowFocus = () => {
  clearNotifyList()
  win.flashFrame(false)
  resetTrayIcon()
}

const clearNotifyList = () => {
  notifyList = []
  if (msgWindow) {
    msgWindow.webContents.send('notify-list', { room: null, action: 'clear' })
  }
  msgWindowHandler.hideWindow()
}
