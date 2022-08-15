'use strict'
import { app, BrowserWindow, dialog, ipcMain, Menu, protocol, screen, shell, Tray } from 'electron'
import createProtocol from './service/createProtocol'
import { initMenu } from '@/service/menuHandler'
import log from 'electron-log'
import { getDownloadPath, separator } from '@/utils/electron-util'
import { prefix, suffix } from '@/utils/media-file'
import { existsSync } from 'fs'
import { renameSync } from 'fs-extra'
import { autoUpdater } from 'electron-updater'
import update from '@/utils/update'
import * as fs from 'fs'
import AdmZip from 'adm-zip'
import os from 'os'
import sudo from 'sudo-prompt'

const resources = process.resourcesPath

const path = require('path')
export let version = ''
export const isDevelopment = process.env.NODE_ENV !== 'production'
export let win
const ex = process.execPath

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])
app.commandLine.appendSwitch('ignore-certificate-errors') // 忽略证书的检测

// 创建主窗口
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
  willDownload()
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

let appIcon

const bindTray = () => {
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
  if (appIcon) {
    appIcon.setImage(iconPath)
  }
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

let downloadFile
const downloadItemList = new Map()
ipcMain.on('download-file', (event, file, again) => {
  const path = again ? file.downloadPath : file.downloadPath + separator(file.downloadPath) + file.name
  const downloadPath = getDownloadPath(prefix(path), suffix(path), 0)
  downloadFile = {
    ...file,
    downloadPath
  }
  win.webContents.downloadURL(file.url)
})
ipcMain.handle('download-file-stop', (event, file) => {
  const downloadItem = downloadItemList.get(file.id)
  if (downloadItem) {
    downloadItem.cancel()
    return true
  }
  return false
})
ipcMain.handle('open-file-dialog', (event, oldPath) => openFileDialog(oldPath))
ipcMain.handle('downloads-path', () => app.getPath('downloads'))
ipcMain.handle('open-file-folder', (event, item) => {
  if (!existsSync(item.downloadPath)) return false
  shell.showItemInFolder(item.downloadPath)
  return true
})
ipcMain.handle('open-file-shell', async (event, item) => {
  if (!existsSync(item.downloadPath)) return false
  await shell.openPath(item.downloadPath)
  return true
})

/**
 * 打开文件选择框
 * @param oldPath - 上一次打开的路径
 */
const openFileDialog = async (oldPath = app.getPath('downloads')) => {
  if (!win) return oldPath

  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: '选择保存位置',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: oldPath
  })

  return !canceled ? filePaths[0] : oldPath
}
const setProgressBar = () => {
  if (!downloadItemList) {
    win.setProgressBar(-1)
    return
  }
  let progress = -1

  downloadItemList.forEach((v) => {
    const number = v.getReceivedBytes() / v.getTotalBytes()
    if (number > progress) {
      progress = number
    }
  })
  win.setProgressBar(progress)
}
const willDownload = () => {
  win.webContents.session.on('will-download', (event, item) => {
    item.setSavePath(downloadFile.downloadPath + '.tmp')
    // 发送下载记录给界面
    item.file = downloadFile
    win.webContents.send('download-file-start', {
      ...item.file,
      receivedBytes: item.getReceivedBytes(),
      totalBytes: item.getTotalBytes()
    })
    // 设置当前下载的列表,用来停止下载
    downloadItemList.set(item.file.id, item)
    item.on('updated', (event, updatedState) => {
      if (updatedState === 'interrupted') {
        log.info('download-file-interrupted')
        // 中断的话直接删除
        downloadItemList.delete(item.file.id)
        win.webContents.send('download-file-interrupted', {
          ...item.file,
          receivedBytes: item.getReceivedBytes(),
          totalBytes: item.getTotalBytes()
        })
      } else if (updatedState === 'progressing') {
        if (item.isPaused()) {
          win.webContents.send('download-file-paused', {
            ...item.file,
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes()
          })
        } else {
          win.webContents.send('download-file-ing', {
            ...item.file,
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes()
          })
          setProgressBar()
          // console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })
    item.once('done', (event, state) => {
      // 结束的话直接删除
      downloadItemList.delete(item.file.id)
      setProgressBar()
      if (state === 'completed') {
        renameSync(item.file.downloadPath + '.tmp', item.file.downloadPath)
        win.webContents.send('download-file-done', { ...item.file })
      } else if (state === 'cancelled') {
        win.webContents.send('download-file-cancelled', { ...item.file })
      } else {
        win.webContents.send('download-file-fail', { ...item.file })
      }
    })
  })
}

// 系统更新========================================
// 开启开发者模式更新
Object.defineProperty(app, 'isPackaged', {
    get() {
        return true
    }
})
let downloadUpdateIng = false
export const updateHandle = () => {
  log.transports.file.level = 'debug'
  autoUpdater.logger = log
  // autoUpdater.setFeedURL(updateUrl)

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  // autoUpdater.checkForUpdates().then(() => {
  // })
  // 更新失败
  autoUpdater.on('error', (info) => {
    // win?.webContents.send('check-update-error', info)
    log.info('更新失败', info)
  })
  // 当开始检查更新的时候触发。
  autoUpdater.on('checking-for-update', (info) => {
    log.info('检查更新', info)
    win.webContents.send('checking-for-update', info)
  })
  // 当发现一个可用更新的时候触发，更新包下载会自动开始。
  autoUpdater.on('update-available', (info) => {
    log.info('当前运行版本:', version, ' 检查版本', info.version)
    if (version === info.version) {
      win.webContents.send('update-not-available', info)
    } else {
      win.webContents.send('update-available', info)
    }
  })
  // 当没有可用更新的时候触发。
  autoUpdater.on('update-not-available', (info) => {
    win.webContents.send('update-not-available', info)
  })
  // 下载进度监听
  autoUpdater.on('download-progress', (progress) => {
    log.info('下载进度监听', progress)
    // win?.webContents.send('download-progress', progress)
  })
  // 下载完成,等待下一步动作
  autoUpdater.on('update-downloaded', function () {
    win.webContents.send('update-downloaded')
    ipcMain.on('quit-and-install', () => {
      autoUpdater.quitAndInstall()
    })
  })
  // 监听消息检查更新
  ipcMain.on('check-update', () => {
    // if (isDevelopment) {
    //   win.webContents.send('development-model')
    //   return
    // }
    log.info('检查更新指令,当前', version)
    autoUpdater.checkForUpdates().then(() => {
    })
  })
  // 监听下载命令执行下载
  ipcMain.on('download-update', () => {
    autoUpdater.downloadUpdate().then(() => {
    })
  })

  const appPath = path.dirname(app.getPath('exe'))
  const temp = path.dirname(os.tmpdir())
  const unPackage = `${appPath}/resources/app.asar.unpacked`
  const unPackageBack = `${appPath}/resources/app.asar.unpacked.back`
  const zipFile = `${temp}/im/app.zip`
  const zipUnPackage = `${temp}/im/app.asar.unpacked`
  // 1. 下载到临时文件夹
  // 2. 解压到临时文件夹
  // 3. 备份应用文件夹
  // 4. 移动临时文件夹到应用文件夹
  // 5. 异常情况删除应用文件夹重命名备份文件夹
  log.info('当前文件夹目录', appPath)
  // 增量下载命令
  ipcMain.on('download-increment-update', async (event, version) => {
    if (downloadUpdateIng) {
      log.info('正在下载.... 不要着急')
      return
    }
    const updateUrl = process.env.VUE_APP_UPDATE_URL + 'asar.unpacked_' + version + '.zip'
    if (!fs.existsSync(`${temp}/im`)) {
      fs.mkdirSync(`${temp}/im`)
    }
    // 删除旧包
    if (fs.existsSync(zipFile)) {
      fs.unlinkSync(zipFile)
    }
    downloadUpdateIng = true
    log.info('最新版本', version, '将从', updateUrl, '请求更新, 写入', zipFile)
    await update.downloadFile(updateUrl, zipFile).then(() => {
      log.info('增量文件下载成功')
      win.webContents.send('increment-update-downloaded')
    }).catch(() => {
      downloadUpdateIng = false
      log.info('最新版本', version, '增量更新处置失败')
      win.webContents.send('increment-update-fail')
    })
    downloadUpdateIng = false
  })
  ipcMain.on('increment-install', async () => {
    try {
      // 删除旧解压目录
      if (fs.existsSync(zipUnPackage)) {
        update.deleteDirSync(zipUnPackage)
      }
      // 同步解压缩
      const unzip = new AdmZip(zipFile, {})
      unzip.extractAllTo(zipUnPackage, true, false)
      log.info('app.asar.unpacked.zip 解压缩完成')
      try {
        // 删除备份文件夹
        if (fs.existsSync(unPackageBack)) {
          update.deleteDirSync(unPackageBack)
        }
        // 重命名文件夹
        if (fs.existsSync(unPackage)) {
          fs.renameSync(unPackage, unPackageBack)
        }
        // 如果不存在,则将加压好的文件夹复制过去
        if (!fs.existsSync(unPackage)) { // 删除旧备份
          update.cpSync(zipUnPackage, unPackage) // 创建app来解压用
        }
      } catch (e) {
        log.info('部署失败,待提权处置')
        // 提权删除备份文件夹, 重命名, 复制文件夹 提权恢复
        await new Promise((resolve, reject) => {
          const shell = `ren "${unPackage}" app.asar.unpacked.back &&  mkdir "${unPackage}" && xcopy "${zipUnPackage}" "${unPackage}" /e /y /h /r /q && rd /s /q "${zipUnPackage}"`
          sudo.exec(shell, { name: 'Electron' }, function (error, stdout, stderr) {
            if (error) {
              reject(error)
              log.info('error:' + error)
              return
            }
            resolve(stdout)
            log.info('stdout: ' + stdout)
          })
        })
        log.info('提权执行完成')
      }

      log.info('更新完成，正在重启...')
      setTimeout(() => {
        app.relaunch() // 重启
        app.exit(0)
      }, 1800)
    } catch (e) {
      log.error('增量更新错误', e)
      win.webContents.send('increment-update-fail')
      try {
        if (fs.existsSync(unPackageBack)) {
          fs.renameSync(unPackageBack, unPackage) // 备份目录
        }
      } catch (e) {
        log.info('部署失败2,待提权处置')
        // 提权恢复
        await new Promise((resolve, reject) => {
          const shell = `rd /s /q "${zipUnPackage}" && ren "${unPackageBack}" app.asar.unpacked &&  mkdir "${unPackage}"`
          sudo.exec(shell, { name: 'Electron' }, function (error, stdout, stderr) {
            if (error) {
              reject(error)
              log.info('error:' + error)
              return
            }
            resolve(stdout)
            log.info('stdout: ' + stdout)
          })
        })
        log.info('提权执行完成')
      }
    }
  })
}
