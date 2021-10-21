import Uploader from "simple-uploader.js";
import {mergeFile} from "@/net/api";
// import {sendChatMessage} from "@/net/message";

let uploader = null;
const created = () => {

    uploader = new Uploader({
        target: '/api/file/upload/chunk',
        testChunks: true,
        allowDuplicateUploads: true,
        readFileFn: (fileObj, fileType, startByte, endByte, chunk) => {
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
        // 查询这个文件是不是已经存在了 存在的话直接执行 否则就开始上传

        // files.forEach(x =>{
        //     x.cancel()
        // })
        uploader.upload()
    })
    // 单个文件上传成功
    uploader.on('fileSuccess', async (rootFile, file) => {
        let response = await mergeFile({
            filename: file.name,
            identifier: file.uniqueIdentifier,
            totalSize: file.size,
            type: file.type
        })
        console.log(response)

        const chatMessage = {
            senderId: file.file.senderId,
            roomId: file.file.roomId,
            files: [
                {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    audio: false,
                    duration: file.duration,
                    url: response.location,
                    preview:'',
                }
            ]
        }
        console.log('sendChatMessage',chatMessage)
        // sendChatMessage(chatMessage)
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

const addFiles = (files, senderId, roomId) => {
    if (!files) {
        return
    }
    if (uploader == null) {
        created();
    }
    files.forEach(x => {
        x.name = x.name + '.' + x.extension
        x.senderId = senderId
        x.roomId = roomId
    })
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
