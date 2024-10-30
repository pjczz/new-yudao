├─📄 [readme.md](http://readme.md/) — 说明文件
├─📄 tracking.d.ts —ts类型文件
├─📄 trackRequest.ts —埋点请求的SDK，可迁移到其他项目
├─📄 trackRoute.ts —工具类，提供将ruoyi-pro的url转换为路由获取模块和子模块的方法
└─📄 useTrack.ts —提供埋点的前端交互类，在ruoyipro中可实现全埋点

```jsx
// 接口的所有字段
export interface trackParams {
	project: string // 项目名称 如gx 共享 在环境变量中配置
	system: string // 系统名称  如user-mp 用户端小程序端 在环境变量中配置
	module: string // 模块名称 如用户管理模块 通过trackRoute获取
	sub_modules: string // 子模块列表  从被点击的路由的模块为终点，包括路径上的除了祖先路由的路由模块
	tenantId: string | null // 租户id 设置时传入
	uid: string | null // 获取用户id时设置
	type: number // 1 页面停留 2 点击按钮 3 异常上传 4 访问页面
	startTime: string // 开始时间 如果不是停留 则开始时间=结束时间
	endTime: string // 结束时间
	eventName: string // 事件名称
	eventRes: string //事件结果 除了错误都为success，处理错误会在这个字段写入错误内容
	url: string // 页面地址
	params: string // 额外参数 格式为字符串化的{params:{},data:{}}
	remarks: string // 备注
  platformName: string //平台名称
  platformVersion: string // 平台版本
  machineType: string // 机器类型
  machineSystemVersion: string // 机器版本
  
}

```

## 1、准备工作

### 1.1 环境变量

```jsx
VITE_TRACK_PROJECT='gx' //共享
VITE_TRACK_SYSTEM='user_mp' //用户微信小程序端
VITE_SIGNATURE_KEY='去找后端要key'
```

### 1.2接口签名

```jsx
import SHA256 from 'crypto-js/sha256'
// 生成签名
export function getSignature(data) {
  // 获取当前时间戳
  const timestamp = new Date().getTime()
  // 示例密钥（实际应用中应安全存储）
  const hmacKey = import.meta.env.VITE_SIGNATURE_KEY // HMAC 密钥
  const dataStr = data ? JSON.stringify(data) : ''
  const uuid = generateUUID()

  // 构建需要签名的字符串（加密数据 + 时间戳）
  const dataToSign = dataStr + '_t=' + timestamp + '_u='+ uuid + hmacKey
  const signature = SHA256(dataToSign).toString()
  const headers = {
    _t:timestamp,
    _s:signature,
    _u:uuid
  }
  return headers
}
// 生成uuid
export const generateUUID = () => {
  if (typeof crypto === 'object') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    if (typeof crypto.getRandomValues === 'function' && typeof Uint8Array === 'function') {
      const callback = (c: any) => {
        const num = Number(c)
        return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(
          16
        )
      }
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, callback)
    }
  }
  let timestamp = new Date().getTime()
  let performanceNow =
    (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let random = Math.random() * 16
    if (timestamp > 0) {
      random = (timestamp + random) % 16 | 0
      timestamp = Math.floor(timestamp / 16)
    } else {
      random = (performanceNow + random) % 16 | 0
      performanceNow = Math.floor(performanceNow / 16)
    }
    return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16)
  })
}
```

## 2、在ruoyipro中使用该项目 并使用全埋点（elementui+vue3）

```jsx
// 统一挂载到window上方便全局使用
window.$useTrack = new useTrack({
    request: sendTracking, // 返回值为promise的请求函数
    app, //vue实例 vue2传入vue
    autoClick: true, //是否开启点击事件全埋点 默认为true 仅支持elementui 
    autoError: true, //是否开启错误事件全埋点 默认为true
    autoStay: true, //是否开启错误事件全埋点 默认为true
    autoUrl: true, //是否开启自动通过url获取module和submodules 用于解决不同项目的路由名称问题 默认为true
    intervalTime: 5000, //自动埋点上报间隔时间 默认为5000ms
    retryLimit:3, //自动埋点上报失败重试次数 默认为3次
    stayTime:2000, //页面停留时间小于2s的不会被记录
  })
  // 初始化 尽量在store中调用 登录后获取uid和tenantId 或者在回调函数中赋值  租户id（非多租户的系统 租户id统一为0）
  
  useTrack.setParams({ uid: '2312311', tenantId: '123213' })
  
```

## 3、在web其他后台项目使用

### 3.1 初始化

```jsx
 
// 统一挂载在window上  方便全局的任意模块调用
window.$useTrack = new useTrack({
    request: sendTracking, // 返回值为promise的请求函数
    app,
    autoClick: false, //建议关闭 默认为true
    autoError: true, //是否开启错误事件全埋点 默认为true
    autoStay: true, //是否开启错误事件全埋点 默认为true
    autoUrl: false, //建议关闭 用于解决不同项目的路由名称问题 默认为true
    intervalTime: 5000, //自动埋点上报间隔时间 默认为5000ms
    retryLimit:3, //自动埋点上报失败重试次数 默认为3次
  })
  // 初始化 尽量在store中调用 登录后获取uid和tenantId 或者在回调函数中赋值
  
  useTrack.setParams({ uid: '2312311', tenantId: '123213' })
  
```

```jsx
// 批量埋点方法

export const sendTracking = async (data: trackParams[]) => {

// isRaw代表返回原始数据 不直接返回data

return await request.post({ url: 'http://47.99.177.100:10998/stat_data_adapter-1.0.0/log/reportOperationLog', data , isRaw:'true'})

}

```

### 3.2 手动调用SDK

```jsx
// 根据需求 直接手动在部分页面或全局调用该方法
// 点击事件支持使用指令化 v-track-event="{xxx……}"

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
// 使用getCurrentInstance获取vue挂载的全局变量
const { appContext } = getCurrentInstance()!;
const useTrack = appContext.config.globalProperties.$useTrack
if (useTrack) {
	useTrack.setParams({ uid: userInfo.getUser.id, tenantId: '0' })
}
```

4、捕获所有的错误

```jsx
// SDK为vue提供了两个错误捕获类型 如果需要捕获http请求中发生的错误 则需要手动添加以下代码
1、vue的错误捕获
2、promise的未捕获错误收集
剩余错误捕获是promise中，其中最多的错误发生在http请求的请求拦截器中

//参考函数
const getHttpError = (config, reason, error:unknown =null) => {
  // console.log('在请求中初始化',app)
  if (!config.url.includes('/stat_data_adapter_war_exploded/log/reportOperationLog')) {
    
  const useTrack = window.$useTrack
    if(useTrack){
      console.log('在请求中初始化','http')
    }
    useTrack && useTrack.setErrorParams({
      // url: to.path,
      eventRes: reason,
      params: JSON.stringify({
        params: {},
        data: { error }
      }),
      remarks: ''
    })
  }
}
// 异常说明
//如果在拦截器内部自定义了各种错误处理，并且将他们抛出，使用promise.reject(msg)会抛出到全局的
//未捕获异常中 无需处理 如果使用的同步throw 则会被axios异常捕获与下述条件在一起处理
// 类似404的错误会直接触发axios的异常捕获 需要在此处的异常捕获中添加上述代码
      (error: AxiosError) => {
    console.log('debugger')
    console.log('err' + error,'debuger') // for debug
    let { message } = error
    const { t } = useI18n()
    if (message === 'Network Error') {
      message = t('sys.api.errorMessage')
    } else if (message.includes('timeout')) {
      message = t('sys.api.apiTimeoutMessage')
    } else if (message.includes('Request failed with status code')) {
      message = t('sys.api.apiRequestFailed') + message.substr(message.length - 3)
    }
    ElMessage.error(message)
    ***getHttpError(config, message, error) // 关键函数调用***
    return Promise.reject(error)
  }
```

## 其他

### 1、目前传给接口的module 参数（模块） 仅支持新项目 或每个路由都配置meta:{name:xxx}的项目 （也就是支持后台的动态路由项目）

### 2、已经支持自动监听按钮

 如果按钮在table里 会将table的当前列和表头数据上传

 如果按钮在dialog弹窗里 会将dialog的label和对应的input textArea 值上传 

注意!类似select的值无法通过dom跟踪，只会返回空字符串

### 3、目前手动和自动只能选择一个，后续可以通过设计auto字段进行处理或者在params中{params:{auto：true}

### 4、如果请求函数方法被二次封装必须确认以下事项

1、如果设置baseUrl请修改为判断是否有http 按条件添加  接口路径支持跨域直接使用即可

```jsx
// baseUrl为基本路径
if (!config.url.includes('http')) {
				config.url = base_url + config.url
			}
```

2、如果接口的数据返回也被二次封装，请按isRaw=’true’  进行判断返回原始相应体

```jsx
// 示例代码
post: async <T = any>(option: any) => {
		const res = await request({ method: 'POST', ...option })
		if (option?.headers?.isRaw == 'true') {
			return res as unknown as T
		} else {
			return res.data as unknown as T
		}
	},
```

3、签名请求体问题

```jsx
// 如果请求头也被二次封装 无法根据配置写入 请手动添加
return service({
		url: flag ? `${url}&t=${timeStamp}` : url,
		method,
		params: flag ? params : { ...params, t: timeStamp },
		data,
		...config,
		responseType: responseType,
		headers: {
			'Content-Type': headersType || default_headers,
			A: encryptBase64(timeStamp),
			B: encryptMD5(timeStamp, url),
			_t: option?.headers?._t || '',
			_s: option?.headers?._s || '',
			_u: option?.headers?._u || ''
		}
	})
```

4、临时加的字段

```jsx
  platformName: string //平台名称
  platformVersion: string // 平台版本
  machineType: string // 机器类型
  machineSystemVersion: string // 机器版本
```

这四个字段是临时加的，暂时没有做任何适配，只在类型中加了