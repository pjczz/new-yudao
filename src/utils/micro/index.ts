function isMicro() {
  return window.__MICRO_APP_ENVIRONMENT__
}
// 跳转到主应用的某个路由
export function setupRouter(path: string) {
  if (isMicro()) {
    const baseRouter = (window as any).microApp.router.getBaseAppRouter()
    baseRouter.push(path)
  }
  return
}
// 获取当前路由信息
export function getRouterInfo() {
  try {
    if (isMicro()) {
      const routeInfo = (window as any).microApp.router.current.get('my-app')
      return routeInfo
    }
    return null
  } catch (e) {
    return null
  }
}
// 获取主应用下发的数据
export function getMainData() {
  if (isMicro()) {
    const data = window.microApp.getData() // 返回主应用下发的data数据
    return data
  } else {
    return null
  }
}
// 监听主应用下发的数据
export function getMainDataListener() {
  return new Promise((resolve, reject) => {
    if (isMicro()) {
      window.microApp.addDataListener((data: any) => {
        resolve(data)
      })
    } else {
      reject('err')
    }
  })
}
// 清除监听主应用数据的监听器
export function clearMainDataListener(dataListener) {
  if (isMicro()) {
    window.microApp.clearDataListener(dataListener)
  }
}
// 发送数据到主应用  只能使用回调函数方式
export function sendDataToMain(data) {
  return new Promise((resolve, reject) => {
    window.microApp.dispatch(data, (res: any) => {
      resolve(res)
    })
  })
}
