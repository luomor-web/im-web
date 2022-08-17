// 下载excel等流返回的方式, 此处暂不需要
// export const downloadForUrl = async (url, name) => {
//     const res = await request.get(url, { responseType: 'blob' })
//
//     const blob = new Blob([res], { type: 'application/octet-stream;charset=utf-8' }) // application/vnd.ms-excel这里表示xls类型文件
//     // const contentDisposition = res.headers['content-disposition']; //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
//     // const pat = new RegExp("filename=([^;]+\\.[^\\.;]+);*");
//     try {
//         // const result = pat.exec(contentDisposition);
//         const filename = name
//         const downloadElement = document.createElement('a')
//         const href = window.URL.createObjectURL(blob) // 创建下载的链接
//         const reg = /^["](.*)["]$/g
//         downloadElement.style.display = 'none'
//         downloadElement.href = href
//         downloadElement.download = decodeURI(filename.replace(reg, '$1')) // 下载后文件名
//         document.body.appendChild(downloadElement)
//         downloadElement.click() // 点击下载
//         document.body.removeChild(downloadElement) // 下载完成移除元素
//         window.URL.revokeObjectURL(href) // 释放掉blob对象
//     } catch (error) {
//         console.error(error)
//     }
// }

export const downloadForUrl = (url, name) => {
  const el = document.createElement('a')
  el.style.display = 'none'
  el.setAttribute('target', '_blank')
  /**
   * download的属性是HTML5新增的属性
   * href属性的地址必须是非跨域的地址，如果引用的是第三方的网站或者说是前后端分离的项目(调用后台的接口)，这时download就会不起作用。
   * 此时，如果是下载浏览器无法解析的文件，例如.exe,.xlsx..那么浏览器会自动下载，但是如果使用浏览器可以解析的文件，比如.txt,.png,.pdf....浏览器就会采取预览模式
   * 所以，对于.txt,.png,.pdf等的预览功能我们就可以直接不设置download属性(前提是后端响应头的Content-Type: application/octet-stream，如果为application/pdf浏览器则会判断文件为 pdf ，自动执行预览的策略)
   */
  name && el.setAttribute('download', name)
  el.href = url
  console.log(el)
  document.body.appendChild(el)
  el.click()
  document.body.removeChild(el)
}

const download = (file) => {
    downloadForUrl(file.url, file.name)
}

export default {
    download
}
