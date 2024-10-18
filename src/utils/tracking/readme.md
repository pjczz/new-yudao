# **埋点文件使用**

├─📄 [readme.md](http://readme.md/) — 说明文件
├─📄 tracking.d.ts —ts类型文件
├─📄 trackRequest.ts —埋点请求的SDK，可迁移到其他项目
├─📄 trackRoute.ts —工具类，提供将ruoyi-pro的url转换为路由获取模块和子模块的方法
└─📄 useTrack.ts —提供埋点的前端交互类，在ruoyipro中可实现全埋点

## 1、在ruoyipro中使用该项目 并使用全埋点（elementui+vue3）

```jsx
// 可以在store中初始化，好处是可以在js文件中简单调用
app.config.globalProperties.$useTrack = new useTrack({
    request: sendTracking, // 返回值为promise的请求函数
    app, //vue实例 vue2传入vue
    autoClick: true, //是否开启点击事件全埋点 默认为true 仅支持elementui 
    autoError: true, //是否开启错误事件全埋点 默认为true
    autoStay: true, //是否开启错误事件全埋点 默认为true
    autoUrl: true, //是否开启自动通过url获取module和submodules 用于解决不同项目的路由名称问题 默认为true
    intervalTime: 5000, //自动埋点上报间隔时间 默认为5000ms
    retryLimit:3, //自动埋点上报失败重试次数 默认为3次
  })
  // 初始化 app.vue或其他位置 获取到uid和tenantId以后
  
  useTrack.setParams({ uid: '2312311', tenantId: '123213' })
  
```

## 2、在web其他后台项目使用

### 2.1 初始化

```jsx
// import useTrack from ...
app.config.globalProperties.$useTrack = new useTrack({
    request: sendTracking, // 返回值为promise的请求函数
    app,
    autoClick: false, //建议关闭 默认为true
    autoError: true, //是否开启错误事件全埋点 默认为true
    autoStay: true, //是否开启错误事件全埋点 默认为true
    autoUrl: false, //建议关闭 用于解决不同项目的路由名称问题 默认为true
    intervalTime: 5000, //自动埋点上报间隔时间 默认为5000ms
    retryLimit:3, //自动埋点上报失败重试次数 默认为3次
  })
  // 初始化 app.vue或其他位置 获取到uid和tenantId以后
  
  useTrack.setParams({ uid: '2312311', tenantId: '123213' })
  
```

```jsx
// 批量埋点方法

export const sendTracking = async (data: trackParams[]) => {

// isRaw代表返回原始数据 不直接返回data

return await request.post({ url: '/stat_data_adapter_war_exploded/log/reportOperationLog', data , isRaw:true})

}
useTrackIntance: new useTrack(sendTracking), sendTracking为请求函数

```

### 2.2 手动调用SDK

```jsx
// 根据需求 直接手动在部分页面或全局调用该方法

// 记录停留时间
useTrack.setStayParams({
  url?: string // 页面地址
  startTime: Date // 开始时间
  endTime: Date // 离开时间
  remarks?: string // 备注
  module?: string // 模块
  sub_modules?: string // 子模块数组
  url?:string // 页面路由
  })
  // 记录点击事件

useTrack.setClickParams({
  eventName: string // 页面地址
  remarks?: string // 开始时间
  params?: string // 详细信息 格式为字符串化的{params:{},data:{}}
  module?: string //  模块
  sub_modules?: string // 子模块数组
  url?:string // 页面地址
  })
  // 记录错误上报

useTrack.setErrorParams({
  eventName: string // 页面地址
  remarks?: string // 开始时间
  params?: string // 详细信息 格式为字符串化的{params:{},data:{}}
  module?: string //  模块
  sub_modules?: string // 子模块数组
  url?:string // 页面地址

  })
  // 记录访问页面

useTrack.setAccessParams({
  eventName: string // 页面地址
  remarks?: string // 开始时间
  params?: string // 详细信息 格式为字符串化的{params:{},data:{}}
  module?: string //  模块
  sub_modules?: string // 子模块数组
  url?:string // 页面地址

  })
 
```

## 其他

### 目前页面停留时间采用监听url的方案 仅支持新项目 或每个l路由都配置meta:{name:xxx}的项目

### 已经支持自动监听按钮

 如果按钮在table里 会将table的当前列和表头数据上传

 如果按钮在dialog弹窗里 会将dialog的label和对应的input textArea 值上传 

 注意!类似select的值无法通过dom跟踪，只会返回空字符串