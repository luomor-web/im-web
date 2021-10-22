import {init, mergeMultipartUpload, upload} from "@/net/api";

const CHUNK_SIZE = 5 * 1024 * 1024
import SparkMD5 from 'spark-md5'

export const files = []

const addFiles = async (f) => {
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
            // 上传速度
            speed: 0,
            // 切片完成度
            chunkedProgress: 0,
            // 总大小
            fileSize: formatSize(file.size),
            file: file,
        }
        // this.files.add(data)
        await inputChange(data, (list, len) => {
            const listLen = list.length
            console.log('当前切片进度:', listLen, len)
        })
        console.log(data)

        const response = await init({
            filename: file.name + '.' + file.extension,
            partCount: data.chunks.length,
            md5: data.md5
        })
        console.log('初始化文件上传列表:', response)
        const uploadUrls = response.uploadUrls
        for (let i = 0; i < uploadUrls.length; i++) {
            console.log('文件上传:', uploadUrls[i], data.chunks[i])
            await upload(uploadUrls[i], data.chunks[i].file)
        }
        if (response.uploadId) {
            await mergeMultipartUpload({
                uploadId: response.uploadId,
                objectName: response.objectName
            })
        }

    }

}

const inputChange = async (file, cb) => {
    console.log('开始切片')
    if (file) {
        const fileChunkList = await createFileChunk(file.file, (data, size) => {
            cb(data, size)
        })
        const md5 = await getFileChunkMd5(fileChunkList)
        console.log(md5, '当前文件Md5')
        file.md5 = md5
        file.chunks = fileChunkList
        console.log('切片数据', fileChunkList)
    }
}

const createFileChunk = async (file, cb) => {
    const list = []
    const type = file.type
    console.log('当前文件大小', file.size, 'Byte')
    let size = 0
    const len = Math.ceil(file.size / CHUNK_SIZE)
    console.log(len)
    while (size < file.size) {
        const data = {
            file: file.blob.slice(size, size + CHUNK_SIZE),
            type: type
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
                console.info('获取Md5完成')
                resolve(spark.end())
            }
        }
        fileReader.onerror = function() {
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
