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

export function getDownloadPath(path, type, n) {
    const joinStr = path + (n ? `(${n})` : '') + (type? '.' : '') + type;
    const res = existsSync(joinStr);
    if (res) {
        return getDownloadPath(path, type, ++n);
    } else {
        return joinStr
    }
}

export default {
    openFileLocation,
    separator
}
