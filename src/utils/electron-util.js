const {sep} = require('path')
const {existsSync} = require('fs')
const {shell} = require('electron')

export function separator(path) {
   return path.endsWith(sep) ? "" : sep
}

export function openFileLocation(path) {
   if (!existsSync(path)) return false
   shell.showItemInFolder(path)
   return true
}

export default {
   openFileLocation,
   separator
}
