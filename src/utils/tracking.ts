import { trackParams } from '../api/track/manual/index'
import { useRoute } from 'vue-router'
// tracking.js
export class useTrack {
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
  }
  _isWebEnvironment() {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined'
  }
  // 设置参数
  setParams = (params) => {
    const flag = this._isWebEnvironment()
    if (params && typeof params === 'object') {
      
      // 首次注册需要设置uid
      if (params.userId) {
        this.params.uid = params.uid
      }
      // 默认在此处获取URL
      this._getRoute()
      
      // 变量赋值
      Object.keys(params).forEach((item) => {
        this.params[item] = params[item]
      })
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
    if (!this.params) return
    this._getQueryString()
    this.request(this.params)
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
}
