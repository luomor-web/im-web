import axios from 'axios'
import tip from '@/plugins/tip'
// import store from '@/store'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API + '/api', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    // if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers['X-Token'] = getToken()
    // }

    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(

  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    // if (res.code !== '1000') {
    //   return Promise.reject(new Error(res.message || 'Error'))
    // }

    return res
  },
  err => {
      if (err.response.status === 502) {
        tip.info('网络错误,请联系管理员')
      }
      const config = err.config
      // If config does not exist or the retry option is not set, reject
      if (!config || !config.retry) return Promise.reject(err)

      // Set the variable for keeping track of the retry count
      config.__retryCount = config.__retryCount || 0

      // Check if we've maxed out the total number of retries
      if (config.__retryCount >= config.retry) {
          // Reject with the error
          return Promise.reject(err)
      }

      // Increase the retry count
      config.__retryCount += 1

      // Create new promise to handle exponential backoff
      const backoff = new Promise(function (resolve) {
          setTimeout(function () {
              resolve()
          }, config.retryDelay || 1)
      })

      // Return the promise in which recalls axios to retry the request
      return backoff.then(function () {
          return axios(config)
      })
  }
)

export default service
