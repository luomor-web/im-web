
// 绑定快捷键, 打开控制台
import { dialog, Menu } from 'electron'
import { hideWindow } from '@/background'

export const initMenu = () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'Console',
      accelerator: 'F12',
      click: (item, focusedWindow) => {
        focusedWindow.webContents.toggleDevTools()
      }
    },
    {
      label: 'close',
      accelerator: 'CmdOrCtrl+d',
      click: (it) => {
        hideWindow()
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
          storages: ['appcache', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
        }).then(() => {
          dialog.showMessageBox(focusedWindow, {
            type: 'info',
            title: '清除缓存',
            buttons: ['OK'],
            message: '清除缓存成功'
          }).then(() => {
          })
        })
      }
    }
  ]))
}
