'use strict'

import {app, BrowserWindow, dialog, ipcMain, Menu, protocol, Tray} from 'electron'
import createProtocol from './service/createProtocol'
import {autoUpdater} from 'electron-updater'
import update from "@/utils/update";
import {homedir} from 'os'

const log = require("electron-log")

const resources = process.resourcesPath

const AdmZip = require('adm-zip')

const fs = require('fs')
const path = require('path')

let version = ''

const isDevelopment = process.env.NODE_ENV !== 'production'

let win
let appIcon

protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true}}])

function createWindow() {
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
            if (!process.env.IS_TEST) win.webContents.toggleDevTools()
        })
    } else {
        createProtocol('app', path.join(resources, './app.asar.unpacked'))
        win.loadURL('app://./index.html').then(() => {
        })
    }

    win.on('closed', () => {
        win = null
    })

    win.on('ready-to-show', function () {
        win.show() // 初始化后再显示
    })
}

app.commandLine.appendSwitch('ignore-certificate-errors')    //忽略证书的检测
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
    createWindow()
    bindTray()
    updateHandle()
    willDownload()
})

ipcMain.on('min', () => win.minimize())

ipcMain.on('max', () => win.isMaximized() ? win.unmaximize() : win.maximize())

ipcMain.on('close', () => {
    hideWindow()
})

ipcMain.on('quit', () => app.quit())

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
        label: 'reload',
        accelerator: 'CmdOrCtrl+r',
        click: (item, focusedWindow) => {
            focusedWindow.webContents.reload()
        }
    },
    {
        label: 'Clear Cache',
        accelerator: 'CmdOrCtrl+Shift+Delete',
        click: (item, focusedWindow) => {
            focusedWindow.webContents.session.clearStorageData({
                storages: ['appcache', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage'],
            }).then(() => {
                dialog.showMessageBox(focusedWindow, {
                    type: 'info',
                    title: '清除缓存',
                    buttons: ['OK'],
                    message: '清除缓存成功'
                }).then(() => {
                })
            });
        }
    }
]))

// 绑定托盘
const bindTray = () => {
    const iconPath = path.join(__dirname, isDevelopment ? '../public/icons/tray.ico' : './icons/tray.ico')
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
                app.quit();
            }
        }
    ]))
    appIcon.setToolTip('信使')
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

// 文件下载========================================
let fileName = ''
ipcMain.on('download-file', (event, file) => {
    fileName = file.name
    win.webContents.downloadURL(file.url)
})

const willDownload = () => {
    win.webContents.session.on('will-download', (event, item) => {
        item.setSavePath(homedir() + '\\Downloads\\' + fileName)
        console.log(item.getSavePath());
        item.on('updated', (event, updatedState) => {
            if (updatedState === 'interrupted') {
                console.log('下载中断。可以恢复', item.canResume())
            } else if (updatedState === 'progressing') {
                if (item.isPaused()) {
                    log.info("下载暂停");
                } else {
                    log.info("下载中");
                    // console.log(`Received bytes: ${item.getReceivedBytes()}`)
                }
            }
        })
        item.once('done', (event, state) => {
            console.log('下载完成', event, state)
        })
    })
}

ipcMain.handle('open-file-dialog', (event, oldPath) => openFileDialog(oldPath))
ipcMain.handle('downloads-path', () => app.getPath('downloads'))

/**
 * 打开文件选择框
 * @param oldPath - 上一次打开的路径
 */
const openFileDialog = async (oldPath= app.getPath('downloads')) => {
    if (!win) return oldPath

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: '选择保存位置',
        properties: ['openDirectory', 'createDirectory'],
        defaultPath: oldPath,
    })

    return !canceled ? filePaths[0] : oldPath
}

// 系统更新========================================

// 开启开发者模式更新
// Object.defineProperty(app, 'isPackaged', {
//     get() {
//         return true;
//     }
// });

const updateHandle = () => {
    log.transports.file.level = "debug"
    autoUpdater.logger = log
    // autoUpdater.setFeedURL(updateUrl)

    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false

    autoUpdater.checkForUpdates().then(() => {
    })
    autoUpdater.on('error', (info) => {
        console.log('更新失败', info)
    })
    // 更新失败
    autoUpdater.on('error', (info) => {
        // win?.webContents.send('check-update-error', info)
        console.log('更新失败', info)
    })
    // 当开始检查更新的时候触发。
    autoUpdater.on('checking-for-update', (info) => {
        log.info('检查更新')
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
            autoUpdater.quitAndInstall();
        });
    })
    // 监听消息检查更新
    ipcMain.on('check-update', () => {
        autoUpdater.checkForUpdates().then(() => {
        })
    })
    // 监听下载命令执行下载
    ipcMain.on('download-update', () => {
        autoUpdater.downloadUpdate().then(() => {
        })
    })

    const appPath = path.dirname(app.getPath('exe'));
    const unPackage = `${appPath}/resources/app.asar.unpacked`
    const unPackageBack = `${appPath}/resources/app.asar.unpacked.back`
    const zipFile = `${appPath}/resources/app.zip`


    log.info('当前文件夹目录', appPath)
    // 增量下载命令
    ipcMain.on('download-increment-update', async (event, version) => {
        const updateUrl = process.env.VUE_APP_UPDATE_URL + 'asar.unpacked_' + version + '.zip'
        // 删除旧包
        if (fs.existsSync(zipFile)) {
            fs.unlinkSync(zipFile)
        }
        log.info('最新版本', version, ' 将从', updateUrl, '请求更新')
        const download = await update.downloadFile(updateUrl, zipFile).catch(() => {
            win.webContents.send('increment-update-fail')
        })
        log.info('文件下载结果', download)
        win.webContents.send('increment-update-downloaded')
    })
    ipcMain.on('increment-install', () => {
        try {
            // 删除旧备份目录
            if (fs.existsSync(unPackageBack)) {
                update.deleteDirSync(unPackageBack)
            }
            // 重命名文件夹
            if (fs.existsSync(unPackage)) {
                fs.renameSync(unPackage, unPackageBack);
            }
            // 新建装载文件夹
            if (!fs.existsSync(unPackage)) { // 删除旧备份
                fs.mkdirSync(unPackage) // 创建app来解压用
            }
            try {
                // 同步解压缩
                const unzip = new AdmZip(zipFile, {})
                unzip.extractAllTo(unPackage, true, false)
                log.info('app.asar.unpacked.zip 解压缩完成')
                log.info('更新完成，正在重启...')
                setTimeout(() => {
                    app.relaunch(); // 重启
                    app.exit(0);
                }, 1800);
            } catch (e) {
                log.error('增量更新解压错误', e)
                win.webContents.send('increment-update-fail')
            }
        } catch (e) {
            log.error('增量更新错误', e)
            win.webContents.send('increment-update-fail')
            if (fs.existsSync(unPackageBack)) {
                fs.renameSync(unPackageBack, unPackage); // 备份目录
            }
        }
    })
}
