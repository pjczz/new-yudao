// 引入unocss css
import '@/plugins/unocss'

// 导入全局的svg图标
import '@/plugins/svgIcon'

// 初始化多语言
import { setupI18n } from '@/plugins/vueI18n'
import 'unocss'

// 引入状态管理
import { setupStore } from '@/store'

// 全局组件
import { setupGlobCom } from '@/components'

// 引入 element-plus
import { setupElementPlus } from '@/plugins/elementPlus'

// 引入 form-create
import { setupFormCreate } from '@/plugins/formCreate'

// 引入全局样式
import '@/styles/index.scss'

// 引入动画
import '@/plugins/animate.css'

// 路由
import router, { setupRouter } from '@/router'

import useTrack from '@/utils/tracking/useTrack'

// 权限
import { setupAuth } from '@/directives'

import { createApp } from 'vue'

import App from './App.vue'

import './permission'

// import trackMixin from '@/mixins/trackMixin'
// import { sendTracking } from './api/track/manual'

import '@/plugins/tongji' // 百度统计
import Logger from '@/utils/Logger'

import VueDOMPurifyHTML from 'vue-dompurify-html' // 解决v-html 的安全隐患
import { sendTracking } from './api/track/manual'
import { clickTrackDirective } from './directives/trackEvent/useTrackEvent'

// 创建实例
let app: any = null
window.mount = async () => {
  app = createApp(App)

  await setupI18n(app)

  setupStore(app)

  setupGlobCom(app)

  setupElementPlus(app)

  setupFormCreate(app)

  setupRouter(app)

  setupAuth(app)

  window.$useTrack = new useTrack({
    request: sendTracking,
    app,
    autoClick: true, //是否开启点击事件全埋点 默认为true
    autoError: true, //是否开启错误事件全埋点 默认为true
    autoStay: true, //是否开启错误事件全埋点 默认为true
    autoUrl: true, //是否开启自动通过url获取module和submodules 用于解决不同项目的路由名称问题 默认为true
    intervalTime: 5000, //自动埋点上报间隔时间 默认为5000ms
    retryLimit: 3 //自动埋点上报失败重试次数 默认为3次
  })
  app.directive('trackEvent', clickTrackDirective)
  await router.isReady()
  // app.mixin(trackMixin);
  // app.config.errorHandler = (err, instance, info) => {
  //   // err: 错误对象
  //   // instance: 发生错误的组件实例
  //   // info: 错误的具体信息，比如生命周期钩子、渲染函数等

  //   console.error('捕获到全局错误:', err);
  //   console.log('错误发生在组件:', instance);
  //   console.log('错误信息:', info);
  //   const userStoreTrack = useUserStore()
  //   const useTrack = userStoreTrack.getUseTrackIntance
  //   useTrack.setErrorParams({
  //     eventRes: info,
  //     params: JSON.stringify({
  //       params: {},
  //       data: {err}
  //     }),
  //     remarks: ''
  //   })

  //   // 在这里可以将错误上报到服务器
  //   // reportError(err, instance, info);
  // };
  app.use(VueDOMPurifyHTML)

  app.mount('#app')
}

Logger.prettyPrimary(`欢迎使用`, import.meta.env.VITE_APP_TITLE)

window.unmount = () => {
  app.unmount()
  app = null
}
// 如果不在微前端环境，则直接执行mount渲染
if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount()
}
export default app
