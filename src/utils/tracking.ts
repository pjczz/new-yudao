import {
  trackParams,
  trackMutiParams,
  trackClickParams,
  trackErrorParams,
  trackStayParams,
  trackInputParams
} from '@/types/tracking'

// tracking.js 最好在获取uid或获取token的地方做初始化和刷新操作
export class useTrack {
  // 设计异步批量请求埋点
  private requestList: trackMutiParams[] = []
  INITPARAMS = {
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
    eventRes: 'success',
    url: '',
    params: '',
    remarks: '',
    retry: 1
  }
  private params: trackMutiParams = { ...this.INITPARAMS }

  private request: Function = function () {}
  constructor(request) {
    this.request = request
    this._setTimerToSendRequest()
  }
  _isWebEnvironment() {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined'
  }
  // 初始化参数
  _initParams() {
    // 初始化不改动uid 和tenantId  这两个id只受setParams方法改动
    const { uid, tenantId } = this.params
    this.params = {
      ...this.INITPARAMS,
      uid,
      tenantId
    }
  }
  // 设置参数
  setParams = (params: { uid?: string; tenantId?: string }) => {
    this.params.uid = params.uid ? params.uid : this.params.uid
    this.params.tenantId = params.tenantId ? params.tenantId : this.params.tenantId
  }
/**
   *页面停留的传参方法
   */
   setStayParams = (params: trackStayParams) => {
    if (!this.params.uid || !this.params.tenantId) return
    this._getRoute()
    this.params.type = 1
    this.params.eventName = '页面停留'
    // 变量赋值
    Object.keys(params).forEach((item) => {
      if (item != 'uid') this.params[item] = params[item]
      if (item == 'startTime' || item == 'endTime') {
        this.params[item] = this._formatDate(params[item])
      }
    })
    this.requestList.push(this.params)
    // 每次设置都重置参数
    this._initParams()
  }
  /**
   * 点击事件的传参方法
   */
  setClickParams = (params: trackClickParams) => {
    if (!this.params.uid || !this.params.tenantId) return
    // 默认在此处获取URL和路由
    this._getRoute()
    this.params.type = 2
    this.params.startTime = this._formatDate(new Date())
    this.params.endTime = this.params.startTime
    // 变量赋值
    Object.keys(params).forEach((item) => {
      if (item != 'uid') this.params[item] = params[item]
    })
    this.requestList.push(this.params)
    // 每次设置都重置参数
    this._initParams()
  }
  /**
   *异常事件的传参方法
   */
  setErrorParams = (params: trackErrorParams) => {
    if (!this.params.uid || !this.params.tenantId) return
    this._getRoute()
    this.params.type = 3
    this.params.startTime = this._formatDate(new Date())
    this.params.endTime = this.params.startTime
    // 变量赋值
    Object.keys(params).forEach((item) => {
      if (item != 'uid') this.params[item] = params[item]
    })
    this.requestList.push(this.params)
    // 每次设置都重置参数
    this._initParams()
  }
  

  // 发送请求
  /**
   * 每次请求之前都先删除重试过多的接口 保证每个埋点最多重试3次
   * @returns
   */
  sendRequest = () => {
    // 删除重试次数大于3次的埋点数据
    this._deleteOverTryParam()
    // 未空则不执行
    if (!this.requestList || !this.requestList.length) return
    const requestTempList: trackParams[] = []

    this.requestList.forEach((item) => {
      const obj = {}
      Object.keys(item).forEach((key) => {
        if (key != 'retry') obj[key] = item[key]
      })
      requestTempList.push(obj as trackParams)
    })

    // 执行所有存起来的请求
    // 发送失败则添加重试的次数
    this.request(requestTempList)
      .then((res) => {
        if (res.ret) {
          this.requestList = []
        } else {
          this._increaseParamsRetry()
        }
      })
      .catch((err) => {
        this._increaseParamsRetry()
      })
    // uni.request({
    // 	url: this.url + "?" + this.queryString,
    // })
  }
  // 处理发送失败的数据
  _increaseParamsRetry() {
    this.requestList.forEach((item) => {
      item.retry++
    })
  }
  // 删除重试次数大于3次的埋点数据
  _deleteOverTryParam() {
    this.requestList.forEach((item: trackMutiParams, index: number) => {
      if (item.retry > 3) {
        this.requestList.splice(index, 1)
      }
    })
  }
  _getRetryParam() {}
  // 获取当前路由
  _getRoute() {
    const flag = this._isWebEnvironment()
    if (!flag) {
      // uniapp支持
      const pages = getCurrentPages()
      const page = pages[pages.length - 1]
      this.params.url = page.route
    } else {
      // web端支持
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
  // 放入工具函数
  _formatDate(date) {
    // 获取完整年份
    const year = date.getFullYear()

    // 获取月份（月份需要 +1，因为 getMonth() 返回 0-11）
    const month = String(date.getMonth() + 1).padStart(2, '0')

    // 获取日期
    const day = String(date.getDate()).padStart(2, '0')

    // 获取小时
    const hours = String(date.getHours()).padStart(2, '0')

    // 获取分钟
    const minutes = String(date.getMinutes()).padStart(2, '0')

    // 获取秒数
    const seconds = String(date.getSeconds()).padStart(2, '0')

    // 拼接成 yyyy-MM-dd HH:mm:ss 格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}
