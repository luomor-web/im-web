// 文件下载========================================
import { app, dialog, ipcMain, shell } from 'electron'
import { getDownloadPath, separator } from '@/utils/electron-util'
import { prefix, suffix } from '@/utils/media-file'
import { win } from '@/background'
import log from 'electron-log'
import { renameSync } from 'fs-extra'
import { existsSync } from 'fs'

let downloadFile
const downloadItemList = new Map()

// 文件下载========================================

export const downloadHandle = () => {
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
  willDownload()
}

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

