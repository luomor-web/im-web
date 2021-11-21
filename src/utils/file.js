import {init, mergeMultipartUpload, upload} from "@/net/api";
import SparkMD5 from 'spark-md5'

const CHUNK_SIZE = 5 * 1024 * 1024

export let files = []

const addFiles = async (f, roomId, cb) => {
    for (let file of f) {
        const data = {
            // 文件名
            name: file.name + '.' + file.extension,
            // 文件类型
            type: file.type,
            // 文件md5
            md5: '',
            // 切片列表
            chunks: [],
            // 上传进度
            percentage: 0,
            // 已上传大小
            uploaded: '',
            // 开始上传时间
            uploadTime: 0,
            // 上传速度
            speed: 0,
            // 切片完成度
            chunkedProgress: 0,
            // 总数量大小
            fileSizeByte: file.size,
            // 总大小
            fileSize: formatSize(file.size),
            // 原始文件
            file: file,
            // url
            url: '',
        }

        await inputChange(data, (list, len) => {
            const listLen = list.length
            data.chunkedProgress = listLen <= 0 ? 0 : Math.round((listLen / len) * 10000) / 100.0
        })
        console.log('切片完成:', data.md5)

        const response = await init({
            filename: file.name + '.' + file.extension,
            partCount: data.chunks.length,
            md5: data.md5,
            contentType: file.type,
        })
        console.log(response)
        data.url = response.objectName

        if (!response.quick) {
            const uploadUrls = response.uploadUrls

            const promises = [];
            data.uploadTime = new Date().getTime()
            console.log('开始上传:', data.uploadTime)
            for (let i = 0; i < uploadUrls.length; i++) {
                promises.push(new Promise((resolve) => {
                    upload(uploadUrls[i], data.chunks[i].file, (loaded, total) => {
                        data.chunks[i].uploadProgress = loaded
                        data.chunks[i].total = total
                    }).then(() => {
                        resolve()
                    })
                }))
            }
            const t = setInterval(() => {
                countSpeed(data)
            }, 300)
            Promise.all(promises).then(async () => {
                files.push(data)
                clearInterval(t)
                mergeMultipartUpload({
                    uploadId: response.uploadId,
                    objectName: response.objectName,
                    md5: data.md5
                })
                console.log('文件合并完成!')
                checkOver(data,f,cb)
            })
        } else {
            files.push(data)
            checkOver(data,f,cb)
        }
    }

}

const checkOver = (data,target,cb) => {
    if (files.length === target.length) {
        files = []
        cb({...data.file, url: data.url}, true)
    } else {
        cb({...data.file, url: data.url}, false)
    }
}

const countSpeed = (data) => {
    let uploaded = 0;
    data.chunks.forEach(x => {
        uploaded += x.uploadProgress
    })
    const useTime = new Date().getTime() - data.uploadTime
    const speed = uploaded / (useTime / 1000)
    data.percentage = uploaded <= 0 ? 0 : Math.round((uploaded / data.fileSizeByte) * 10000) / 100.0
    data.uploaded = formatSize(uploaded)
    data.speed = formatSize(speed)
    console.log('总大小:', data.fileSize, ' 上传速度:', data.speed, ' 上传百分比:', data.percentage, ' 已上传:', data.uploaded)
}

const inputChange = async (file, cb) => {
    if (file) {
        const fileChunkList = await createFileChunk(file.file, (data, size) => {
            cb(data, size)
        })
        file.md5 = await getFileChunkMd5(fileChunkList)
        file.chunks = fileChunkList
    }
}

const createFileChunk = async (file, cb) => {
    const list = []
    const type = file.type
    let size = 0
    const len = Math.ceil(file.size / CHUNK_SIZE)
    while (size < file.size) {
        const data = {
            file: file.blob.slice(size, size + CHUNK_SIZE),
            type: type,
            uploadProgress: 0,
            total: 0
        }
        list.push(data)
        size += CHUNK_SIZE
        cb(list, len)
    }
    return list;
}

const getFileChunkMd5 = (fileChunkList) => {
    return new Promise((resolve) => {
        // 总切片数
        const chunkSize = fileChunkList.length
        // 当前处理位置
        let currentChunk = 0
        // SparkMD5实例的ArrayBuffer
        const spark = new SparkMD5.ArrayBuffer()

        const fileReader = new FileReader()
        fileReader.onload = (e) => {
            try {
                spark.append(e.target.result)
            } catch (error) {
                console.log('获取Md5错误，错误位置：' + currentChunk)
            }
            currentChunk++

            if (currentChunk < chunkSize) {
                loadNext()
            } else {
                resolve(spark.end())
            }
        }
        fileReader.onerror = function () {
            console.warn('Md5：文件读取错误')
        }

        function loadNext() {
            fileReader.readAsArrayBuffer(fileChunkList[currentChunk].file)
        }

        loadNext()
    })
}

const formatSize = (size) => {
    if (size < 1024) {
        return size.toFixed(0) + ' bytes'
    } else if (size < 1024 * 1024) {
        return (size / 1024.0).toFixed(0) + ' KB'
    } else if (size < 1024 * 1024 * 1024) {
        return (size / 1024.0 / 1024.0).toFixed(1) + ' MB'
    } else {
        return (size / 1024.0 / 1024.0 / 1024.0).toFixed(1) + ' GB'
    }
}

export {
    addFiles
}
