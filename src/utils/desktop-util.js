import api from '@/net/api'
import { downloadForUrl } from '@/utils/download'

export const downloadDesktop = async() => {
    const data = await api.downloadClient()
    // 转换成数组
    const snsArr = data.split(/[(\r\n)\r\n]+/)
    const paths = snsArr.find(r => r.startsWith('path'))
    const url = paths.replace(' ', '').split(':')[1]
    await downloadForUrl(process.env.VUE_APP_UPDATE_URL + url, url)
}
