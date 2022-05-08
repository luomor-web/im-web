const path = require('path')
const AdmZip = require('adm-zip')
const config = require('./package.json')

exports.default = async function (context) {
    let targetPath
    if (context.packager.platform.nodeName === 'darwin') {
        targetPath = path.join(context.appOutDir, `${context.packager.appInfo.productName}.app/Contents/Resources`)
    } else {
        targetPath = path.join(context.appOutDir, './resources')
    }
    const unpacked = path.join(targetPath, './app.asar.unpacked')
    const zip = new AdmZip();
    zip.addLocalFolder(unpacked)
    zip.writeZip(path.join(context.outDir, 'asar.unpacked_' + config.version + '.zip'))
}
