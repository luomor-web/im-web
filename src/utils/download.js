import request from "@/utils/request";

export const downloadForUrl = async (url, name) => {
    let res = await request.get(url, {responseType: 'blob'})

    const blob = new Blob([res], {type: 'application/octet-stream;charset=utf-8'}); //application/vnd.ms-excel这里表示xls类型文件
    // const contentDisposition = res.headers['content-disposition']; //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
    // const pat = new RegExp("filename=([^;]+\\.[^\\.;]+);*");
    try {
        // const result = pat.exec(contentDisposition);

        const filename = name
        const downloadElement = document.createElement('a');
        const href = window.URL.createObjectURL(blob); //创建下载的链接
        const reg = /^["](.*)["]$/g;
        downloadElement.style.display = 'none';
        downloadElement.href = href;
        downloadElement.download = decodeURI(filename.replace(reg, "$1")); //下载后文件名
        document.body.appendChild(downloadElement);
        downloadElement.click(); //点击下载
        document.body.removeChild(downloadElement); //下载完成移除元素
        window.URL.revokeObjectURL(href); //释放掉blob对象
    } catch (error) {
        console.error(error)
    }
}


export default {
    downloadForUrl
}