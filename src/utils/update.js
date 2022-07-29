/**
 * 工具集
 */
const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const https = require('https')
const axios = require('axios').default

/**
 * 删除文件或文件夹
 * @param {string} dir 文件夹位置
 */
function deleteDirSync (dir) {
  const files = fs.readdirSync(dir)
  for (let i = 0; i < files.length; i++) {
    const newPath = path.join(dir, files[i])
    const stat = fs.statSync(newPath)
    if (stat.isDirectory()) {
      // 如果是文件夹就递归下去
      deleteDirSync(newPath)
    } else {
      // 删除文件
      fs.unlinkSync(newPath)
    }
  }
  fs.rmdirSync(dir)// 如果文件夹是空的，删除自身
}

/**
 * 通过main进程发送事件给renderer进程，提示更新信息
 * @param {string} text 信息
 * @param {object} mainWindow 实例
 */
function sendUpdateMessage (text, mainWindow) {
  log.info('enter sendUpdateMessage', text)
  mainWindow.webContents.send('message', text)
}

/**
 * 下载远程压缩包并写入指定文件
 * @param uri 远程地址
 * @param filename 文件名
 */
function downloadFile (uri, filename) {
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filename)
    const agent = new https.Agent({
      rejectUnauthorized: false
    })
    axios.get(uri, { responseType: 'stream', httpsAgent: agent }).then(res => {
      res.data.pipe(writer)
    }).catch(e => {
      log.error('写入失败', e)
      reject(e)
    })

    writer.on('finish', () => {
      resolve(true)
    })
    writer.on('error', () => {})
  })
}

module.exports = {
  deleteDirSync,
  downloadFile,
  sendUpdateMessage
}
