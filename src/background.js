'use strict'

import {app, ipcMain, protocol, BrowserWindow, Menu, Tray, dialog} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
// import { autoUpdater } from 'electron-updater'
// import config from '../public/config'
import path from 'path'

const versionInfo = require("../package.json")

const isDevelopment = process.env.NODE_ENV !== 'production'

let win
let appIcon

protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true}}])

function createWindow() {
    win = new BrowserWindow({
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
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.toggleDevTools()
    } else {
        createProtocol('app')
        win.loadURL('app://./index.html')
    }

    win.on('closed', () => {
        win = null
    })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        console.log('开发环境')
    }
    createWindow()
    bindTray()
    // updateHandle()
})

ipcMain.on('min', () => win.minimize())

ipcMain.on('max', () => win.isMaximized() ? win.unmaximize() : win.maximize())

ipcMain.on('close', () => {
    hideWindow()
})

ipcMain.on('quit', () => app.quit())

ipcMain.on('get-version-info', () => {
    win.webContents.send('version-info', versionInfo)
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

// 绑定快捷键, 打开控制台
Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
        label: 'Console',
        accelerator: 'F12',
        click: (item, focusedWindow) => {
            focusedWindow.webContents.toggleDevTools()
        }
    },
    {
        label: 'Clear Cache',
        accelerator: 'CmdOrCtrl+Shift+Delete',
        click: (item, focusedWindow) => {
            focusedWindow.webContents.session.clearStorageData({
                storages: ['appcache', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage'],
            });
            dialog.showMessageBox(focusedWindow, {
                type: 'info',
                title: '清除缓存',
                buttons: ['OK'],
                message: '清除缓存成功'
            })
        }
    }
]))

// 绑定托盘
const bindTray = () => {
    const iconPath = path.join(__dirname, isDevelopment ? '../public/icons/tray.png' : './icons/tray.png')
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
                app.quit();
            }
        }
    ]))
    appIcon.setToolTip('ins-im')
    appIcon.on('click', () => {
        showWindow()
    })
}

const showWindow = () => {
    win.setSkipTaskbar(false)
    win.show()
}

const hideWindow = () => {
    win.setSkipTaskbar(true);
    win.hide();
}
