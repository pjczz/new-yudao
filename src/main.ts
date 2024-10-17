// 引入unocss css
import '@/plugins/unocss'

// 导入全局的svg图标
import '@/plugins/svgIcon'

// 初始化多语言
import { setupI18n } from '@/plugins/vueI18n'

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
import { useUserStore } from '@/store/modules/user'

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

// 创建实例
const setupAll = async () => {
  const app = createApp(App)

  await setupI18n(app)

  setupStore(app)

  setupGlobCom(app)

  setupElementPlus(app)

  setupFormCreate(app)

  setupRouter(app)

  setupAuth(app)
  app.config.globalProperties.$useTrack =new useTrack(sendTracking)
  app.config.globalProperties.$useTrack.setApp(app)
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

setupAll()

Logger.prettyPrimary(`欢迎使用`, import.meta.env.VITE_APP_TITLE)
