import SparkMD5 from "spark-md5";
import api, {init, mergeMultipartUpload} from "@/net/api";

const CHUNK_SIZE = 5 * 1024 * 1024

export async function uploadFiles(files, cb) {
    for (let i = 0; i < files.length; i++) {
        const file = {
            ...files[i], // 上传进度
            percentage: 0,
            uploadTotal: [],
            url: '',
        }
        const md5 = await readMd5(file.file);
        const len = Math.ceil(file.size / CHUNK_SIZE)
        const param = {
            filename: file.name + '.' + file.extension, partCount: len, md5: md5, size: file.size
        }
        const response = await init(param);
        const {objectName, uploadId, uploadUrls, quick} = response
        if (!quick) {
            const t = setInterval(() => {
                countSpeed(file, cb)
            }, 300)
            await asyncPool(3, uploadUrls, upload, file)
            const complete = await mergeMultipartUpload({
                uploadId,
                objectName,
                md5,
                name: file.name + '.' + file.extension,
                size: file.size
            });
            if (complete === true) {
                clearInterval(t)
            }
        }
        file.url = objectName
        if (i === (files.length - 1)) {
            cb(file, true)
            continue
        }
        cb(file, false)
    }
}

function countSpeed(file, cb) {
    console.log(file.uploadTotal, 'file.uploadTotal')
    let total = 0
    file.uploadTotal.forEach(x => {
        total += x
    })
    const progress = total <= 0 ? 0 : Math.round((total / file.size) * 10000) / 100.0
    cb({...file, progress}, false)
    return true
}

function asyncPool(poolLimit, array, iteratorFn, file) {
    let i = 0;
    const ret = [];
    const executing = [];
    const enqueue = function () {
        if (i === array.length) {
            return Promise.resolve();
        }
        const item = array[i++];
        const p = Promise.resolve().then(() => iteratorFn(item, array, file));
        ret.push(p);

        let r = Promise.resolve();

        if (poolLimit <= array.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= poolLimit) {
                r = Promise.race(executing);
            }
        }

        return r.then(() => enqueue());
    };
    return enqueue().then(() => Promise.all(ret));
}

const readMd5 = async (file) => {
    return new Promise((resolve => {
        const spark = new SparkMD5.ArrayBuffer();

        const fileReader = new FileReader();

        fileReader.onload = e => {
            spark.append(e.target.result);
            resolve(spark.end(false))
        }
        if (file.size > CHUNK_SIZE) {
            fileReader.readAsArrayBuffer(file.slice(0, CHUNK_SIZE))
        } else {
            fileReader.readAsArrayBuffer(file)
        }
    }))
}

const upload = (item, arr, file) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
        const index = arr.findIndex(x => x === item);
        let endPoint = index * CHUNK_SIZE + CHUNK_SIZE
        if (index === (arr.length - 1)) {
            endPoint = file.size
        }
        console.log(item, index, index * CHUNK_SIZE, endPoint)
        await api.upload(item, file.file.slice(index * CHUNK_SIZE, endPoint), (loaded) => {
            file.uploadTotal[index] = loaded
        })
        resolve(item)
    })
}
