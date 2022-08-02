import path from 'path'
import log from 'electron-log'
import { app, Menu, screen, Tray } from 'electron'
import { isDevelopment, msgWindowHandler, notifyList, showWindow, win } from '@/background'

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
