'use strict'
import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import createProtocol from './service/createProtocol'
import { updateHandle } from '@/service/updateHandler'
import { bindTray, resetTrayIcon, startFlash } from '@/service/trayHandler'
import { initMenu } from '@/service/menuHandler'
import { downloadHandle } from '@/service/downloadHandler'

const resources = process.resourcesPath

const path = require('path')

export let version = ''
export const isDevelopment = process.env.NODE_ENV !== 'production'
export let win

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

// app.commandLine.appendSwitch('ignore-certificate-errors', 'true')
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
      width: 220,
      height: 100,
      frame: false,
      show: false,
      type: 'toolbar',
      alwaysOnTop: true,
      resizable: false,
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
    msgWindow.on('closed', () => {
      msgWindow = null
    })
  },

  hideWindow: () => {
    msgWindow.hide()
  },

  showWindow: (x, y, count) => {
    const height = count <= 8 ? count * 48 : 8 * 48
    msgWindow.setSize(220, height + 28 + 16)
    msgWindow.setPosition(x, y - (height + 28 + 16))
    msgWindow.setAlwaysOnTop(true, 'pop-up-menu')
    msgWindow.show()
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
  msgWindow.webContents.send('notify-list', { room: null, action: 'clear' })
  msgWindowHandler.hideWindow()
}
