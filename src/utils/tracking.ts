import { trackParams } from '../api/track/manual/index'

// tracking.js
export class useTrack {
  // 设计异步批量请求埋点
  private requestList: trackParams[] = []
  private params: trackParams = {
    project: import.meta.env.VITE_TRACK_PROJECT,
    system: import.meta.env.VITE_TRACK_SYSTEM,
    module: '',
    sub_modules: '[]',
    tenantId: null,
    uid: null,
    type: 0,
    startTime: '',
    endTime: '',
    eventName: '',
    eventRes: '',
    url: '',
    params: '',
    remarks: ''
  }
  private queryString: string = ''
  private request: Function = function () {}
  constructor(request) {
    this.queryString = ''
    this.request = request
    this._setTimerToSendRequest()
  }
  _isWebEnvironment() {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined'
  }
  // 设置参数
  setParams = (params) => {
    const flag = this._isWebEnvironment()
    if (params && typeof params === 'object') {
      // 首次注册需要设置uid
      if (params.uid) {
        this.params.uid = params.uid
        console.log('执行了吗', params.uid)
      }
      console.log(params.uid, this.params.uid, 'params.uid')
      // 默认在此处获取URL
      this._getRoute()

      // 变量赋值
      Object.keys(params).forEach((item) => {
        if (item != 'uid') this.params[item] = params[item]
        if(item == 'startTime' || item == 'endTime'){
          this.params[item] = this._formatDate(params[item])
        }
      })
      if(params.type == 1 && params.endTime.getTime() - params.startTime.getTime()<5000){
        return
      }
      this.requestList.push(this.params)
    }
  }
  // 将参数对象转换为查询字符串
  _getQueryString = () => {
    this.queryString = Object.keys(this.params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(this.params[key])}`)
      .join('&')
  }
  // 发送请求
  sendRequest = () => {
    // 未空则不执行
    if (!this.requestList || !this.requestList.length) return
    // this._getQueryString()
    // 执行所有存起来的请求
    this.request(this.requestList).then(()=>{
      this.requestList = []
    }).catch(err=>{
      this.requestList = []
    })
    // uni.request({
    // 	url: this.url + "?" + this.queryString,
    // })
  }
  // 获取当前路由
  _getRoute() {
    const flag = this._isWebEnvironment()
    if (!flag) {
      const pages = getCurrentPages()
      const page = pages[pages.length - 1]
      this.params.url = page.route
    } else {
      this.params.url = window.location.pathname
    }
  }
  _setTimerToSendRequest() {
    setInterval(() => {
      if (this.requestList.length > 0) {
        this.sendRequest()
      }
    }, 5000) // 5秒发送一次请求
  }
  // 外部调用，用于关闭程序时发送
  clearAllRequests() {
    this.sendRequest()
    this.requestList = []
  }
  _formatDate(date) {
    // 获取完整年份
    const year = date.getFullYear();
  
    // 获取月份（月份需要 +1，因为 getMonth() 返回 0-11）
    const month = String(date.getMonth() + 1).padStart(2, '0');
  
    // 获取日期
    const day = String(date.getDate()).padStart(2, '0');
  
    // 获取小时
    const hours = String(date.getHours()).padStart(2, '0');
  
    // 获取分钟
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // 获取秒数
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    // 拼接成 yyyy-MM-dd HH:mm:ss 格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  // 到时候放utils
  _deepClone(obj):trackParams {
    if (obj === null || typeof obj !== 'object') {
      return obj // 处理原始类型或 null
    }
    
    // 处理日期
    // if (obj instanceof Date) {
    //   return new Date(obj)
    // }

    // // 处理正则表达式
    // if (obj instanceof RegExp) {
    //   return new RegExp(obj)
    // }

    // // 处理数组
    // if (Array.isArray(obj)) {
    //   const arrCopy: Array<any> = []
    //   for (let i = 0; i < obj.length; i++) {
    //     arrCopy[i] = this._deepClone(obj[i])
    //   }
    //   return arrCopy
    // }

    // 处理普通对象
    const objCopy = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        objCopy[key] = this._deepClone(obj[key])
      }
    }

    return objCopy as trackParams
  }
}
