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
      log.info('下载中')
      res.data.pipe(writer)
    }).catch(e => {
      log.error('写入失败', e)
      reject(e)
    })

    writer.on('finish', () => {
      log.error('请求下载完成')
      resolve(true)
    })
    writer.on('error', () => {
      log.error('请求下载失败')
    })
  })
}


/** 主要版本 */
const major = process.version.match(/v([0-9]*).([0-9]*)/)[1]
/** 特性版本 */
const minor = process.version.match(/v([0-9]*).([0-9]*)/)[2]
/**
 * 文件夹复制
 * @param {string} source 源文件夹
 * @param {string} destination 目标文件夹
 */
function cpSync(source, destination) {
  // 判断node版本不是16.7.0以上的版本
  // 则进入兼容处理
  // 这样处理是因为16.7.0的版本支持了直接复制文件夹的操作
  if ((Number(major) < 16 || Number(major) === 16) && Number(minor) < 7) {
    // 如果存在文件夹 先递归删除该文件夹
    if (fs.existsSync(destination)) fs.rmSync(destination, { recursive: true })
    // 新建文件夹 递归新建
    fs.mkdirSync(destination, { recursive: true })
    // 读取源文件夹
    const rd = fs.readdirSync(source)
    for (const fd of rd) {
      // 循环拼接源文件夹/文件全名称
      const sourceFullName = source + '/' + fd
      // 循环拼接目标文件夹/文件全名称
      const destFullName = destination + '/' + fd
      // 读取文件信息
      const lstatRes = fs.lstatSync(sourceFullName)
      // 是否是文件
      if (lstatRes.isFile()) fs.copyFileSync(sourceFullName, destFullName)
      // 是否是文件夹
      if (lstatRes.isDirectory()) cpSync(sourceFullName, destFullName)
    }
  } else fs.cpSync(source, destination, { force: true, recursive: true })
}

module.exports = {
  deleteDirSync,
  downloadFile,
  sendUpdateMessage,
  cpSync
}
