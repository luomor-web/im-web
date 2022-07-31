import { BrowserWindow } from 'electron'

let msgWindow

const createWindow = () => {
  msgWindow = new BrowserWindow({
    id: 2,
    width: 200,
    height: 100,
    frame: false,
    show: true,
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
  msgWindow.loadURL('https://192.168.3.128:8888/#/notify')

  msgWindow.on('closed', () => {
    msgWindow = null
  })
}

const hideWindow = () => {
  msgWindow.hide()
}

const showWindow = (x, y) => {
  msgWindow.setPosition(x, y)
  msgWindow.setAlwaysOnTop(true, 'pop-up-menu')
  msgWindow.show()
}

export default {
  createWindow,
  hideWindow,
  showWindow
}
