import trackRequest from './trackRequest'
import { App } from 'vue'
export default class useTrack extends trackRequest {
  enterTime: Date = new Date()
  isWeb: boolean = false
  app: App | null = null
  constructor(request) {
    super(request)
    this.isWeb = super._isWebEnvironment()
    // 开启url监听并上传
    this.listenUrlChange()
    // 开启点击监听
    this.listenClick()
    // 开启错误监听
    this.listenError()
  }
  setApp(app) {
    console.log(app, 'app')
    this.app = app
  }

  // 实例化开启监听
  listenUrlChange() {
    // web环境 执行这样的处理
    if (this.isWeb) {
      this.hookHistoryMethods()
      // 监听通过监听popstate事件 监听url变化
      window.addEventListener('popstate', this.handleUrlChange)
    }
    // unibest 环境
    // 待定
  }
  // 开启点击监听
  listenClick() {
    // 仅在web端的elementui按钮适用
    if (!this.isWeb) return
    window.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement
      // 判断是不是点到了按钮的文字
      const trackableParent = target.closest('.el-button')
      // 点到按钮本身就获取他的span里的文字
      const trackableChildren = target.querySelector('span')
      const table = target.closest('.el-table')
      let clickName = ''
      // 必须点击的元素是按钮或者他的父元素是按钮（点到文字时）
      if (e.target) {
        if (target.tagName === 'BUTTON' && trackableChildren) {
          clickName = trackableChildren.innerText
        } else if (trackableParent && trackableParent.tagName == 'BUTTON') {
          clickName = target.innerText
        } else {
          return
        }
        if (clickName != '') {
          console.log(clickName)
        }

        const threadList: string[] = []
        const selectList: string[] = []
        const dataList: { key: string; value: string }[] = []
        // 处理表格中的编辑
        if (table) {
          // 点击行的所有参数
          const childNodes = target.closest('tr')?.childNodes
          // 获取表头
          const thread = table.querySelector('.el-table thead tr')

          if (childNodes) {
            Array.from(childNodes).forEach((child, index) => {
              selectList.push(child.innerText)
            })
          }
          // 获取表头的列表
          if (thread) {
            Array.from(thread.childNodes).forEach((child, index) => {
              threadList.push(child.innerText)
            })
          }
          // 去除最后一个操作栏
          for (let index = 0; index < selectList.length - 1; index++) {
            dataList.push({
              key: threadList[index],
              value: selectList[index]
            })
          }
          console.log(dataList)
        }
        this.setClickParams({
          eventName: clickName,
          params: JSON.stringify({ params: {}, data: dataList.length > 0 ? dataList : {} })
        })
      }
    })
  }
  // unhandledrejection
  listenError() {
    window.addEventListener('unhandledrejection', (event) => {
      this.setErrorParams({
        // url: to.path,
        eventRes: event.reason,
        params: JSON.stringify({
          params: {},
          data: {}
        }),
        remarks: ''
      })
      // 在这里可以进行上报处理
    })
    // vue3 专属  捕获全局错误
    if (this.app) {
      this.app.config.errorHandler = (err, instance, info) => {
        // err: 错误对象
        // instance: 发生错误的组件实例
        // info: 错误的具体信息，比如生命周期钩子、渲染函数等

        console.error('捕获到全局错误:', err)
        console.log('错误发生在组件:', instance)
        console.log('错误信息:', info)
        this.setErrorParams({
          eventRes: info,
          params: JSON.stringify({
            params: {},
            data: { err }
          }),
          remarks: ''
        })

        // 在这里可以将错误上报到服务器
        // reportError(err, instance, info);
      }
    }
  }
  // 重写pushState和replaceState方法，让popstate可以监听到vue对history的操作
  hookHistoryMethods(): void {
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
  recordEnterTime(): void {
    this.enterTime = new Date()
  }
  // 处理 URL 变化
  handleUrlChange(): void {
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
