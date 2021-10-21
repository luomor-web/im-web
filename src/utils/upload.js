import Uploader from "simple-uploader.js";

let uploader = null;
const created = () => {

    uploader = new Uploader({
        target: 'http://localhost/upload/chunk',
        testChunks: true,
        readFileFn: (fileObj, fileType, startByte, endByte, chunk) => {
            console.log(fileObj, 'testChunks:e')
            console.log(fileObj, fileType, startByte, endByte, chunk)
            chunk.readFinished(fileObj.file.blob.slice(startByte, endByte, fileType))
        },

    })
    // 文件添加 单个文件
    uploader.on('fileAdded', function (file, event) {
        console.log(file, event)
    })

    uploader.on('filesAdded', function (files, fileList, event) {
        console.log(files, fileList, event)
    })

    uploader.on('filesSubmitted', function (files, fileList, event) {
        console.log('filesSubmitted', files, fileList, event)
        uploader.upload()
    })
    // 单个文件上传成功
    uploader.on('fileSuccess', function (rootFile, file, message) {
        console.log(rootFile, file, message)
    })
    // 根下的单个文件（文件夹）上传完成
    uploader.on('fileComplete', function (rootFile) {
        console.log(rootFile)
    })
    // 某个文件上传失败了
    uploader.on('fileError', function (rootFile, file, message) {
        console.log(rootFile, file, message)
    })

}

const addFile = (file) => {
    if (uploader == null) {
        created();
    }
    uploader.addFile(file)
}

const addFiles = (files) => {
    if (!files) {
        return
    }
    if (uploader == null) {
        created();
    }
    uploader.addFiles(files);
}


const destroy = () => {
    console.log("销毁")
}

export {
    created,
    destroy,
    addFile,
    addFiles
}
