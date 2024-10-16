import trackRequest from './trackRequest'
export default class useTrack extends trackRequest {
  enterTime: Date = new Date()
  constructor(request) {
    super(request)
    // 开启url监听并上传
    this.listenUrlChange()
  }

  // 实例化开启监听
  listenUrlChange() {
    // web环境 执行这样的处理
    if (this._isWebEnvironment()) {
      this.hookHistoryMethods()
      // 监听通过监听popstate事件 监听url变化
      window.addEventListener('popstate', this.handleUrlChange)
    }
    // unibest 环境
    // 待定
  }
  // 重写pushState和replaceState方法，让popstate可以监听到vue对history的操作
  hookHistoryMethods() {
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    // 劫持 pushState 方法
    window.history.pushState = (...args) => {
      // 调用原始的 pushState 方法
      const result = originalPushState.apply(window.history, args)
      // 手动触发 URL 变化处理 vue3路由执行
      // this.handleUrlChange()
      return result
    }
    // 劫持 replaceState 方法
    window.history.replaceState = (...args) => {
      // 调用原始的 replaceState 方法
      const result = originalReplaceState.apply(window.history, args)
      // 手动触发 URL 变化处理
      this.handleUrlChange()
      return result
    }
  }
  // 记录进入页面的时间
  recordEnterTime() {
    this.enterTime = new Date()
  }
  // 处理 URL 变化
  handleUrlChange() {
    // 记录离开页面的时间
    const leaveTime = new Date()
    this.setStayParams({
      // url: to.path,
      startTime: this.enterTime,
      endTime: leaveTime,
      remarks: ''
    })
    // 更新进入时间，记录新页面的进入时间
    this.recordEnterTime()
  }
}
