import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { app, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import update from '@/utils/update'
import AdmZip from 'adm-zip'
import { win, version, isDevelopment } from '@/background'

// 系统更新========================================

// 开启开发者模式更新
// Object.defineProperty(app, 'isPackaged', {
//     get() {
//         return true
//     }
// })
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
    if (isDevelopment) {
      win.webContents.send('development-model')
      return
    }
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
  const unPackage = `${appPath}/resources/app.asar.unpacked`
  const unPackageBack = `${appPath}/resources/app.asar.unpacked.back`
  const zipFile = `${appPath}/resources/app.zip`

  log.info('当前文件夹目录', appPath)
  // 增量下载命令
  ipcMain.on('download-increment-update', async (event, version) => {
    if (downloadUpdateIng) {
      log.info('正在下载.... 不要着急')
    }
    const updateUrl = process.env.VUE_APP_UPDATE_URL + 'asar.unpacked_' + version + '.zip'
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
  ipcMain.on('increment-install', () => {
    try {
      // 删除旧备份目录
      if (fs.existsSync(unPackageBack)) {
        update.deleteDirSync(unPackageBack)
      }
      // 重命名文件夹
      if (fs.existsSync(unPackage)) {
        fs.renameSync(unPackage, unPackageBack)
      }
      // 新建装载文件夹
      if (!fs.existsSync(unPackage)) { // 删除旧备份
        fs.mkdirSync(unPackage) // 创建app来解压用
      }
      // 同步解压缩
      const unzip = new AdmZip(zipFile, {})
      unzip.extractAllTo(unPackage, true, false)
      log.info('app.asar.unpacked.zip 解压缩完成')
      log.info('更新完成，正在重启...')
      setTimeout(() => {
        app.relaunch() // 重启
        app.exit(0)
      }, 1800)
    } catch (e) {
      log.error('增量更新错误', e)
      win.webContents.send('increment-update-fail')
      if (fs.existsSync(unPackageBack)) {
        fs.renameSync(unPackageBack, unPackage) // 备份目录
      }
    }
  })
}
