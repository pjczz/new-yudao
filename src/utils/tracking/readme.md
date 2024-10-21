├─📄 [readme.md](http://readme.md/) — 说明文件
├─📄 tracking.d.ts —ts 类型文件
├─📄 trackRequest.ts —埋点请求的 SDK，可迁移到其他项目
├─📄 trackRoute.ts —工具类，提供将 ruoyi-pro 的 url 转换为路由获取模块和子模块的方法
└─📄 useTrack.ts —提供埋点的前端交互类，在 ruoyipro 中可实现全埋点

## 1、准备工作

### 1.1 环境变量

```jsx
VITE_TRACK_PROJECT = 'gx' //共享
VITE_TRACK_SYSTEM = 'user_mp' //用户微信小程序端
VITE_SIGNATURE_KEY = '去找后端要key'
```

### 1.2 接口签名

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
	const dataToSign = dataStr + '_t=' + timestamp + '_u=' + uuid + hmacKey
	const signature = SHA256(dataToSign).toString()
	const headers = {
		_t: timestamp,
		_s: signature,
		_u: uuid
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
				return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(16)
			}
			return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, callback)
		}
	}
	let timestamp = new Date().getTime()
	let performanceNow = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
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

## 2、在 ruoyipro 中使用该项目 并使用全埋点（elementui+vue3）

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
	retryLimit: 3 //自动埋点上报失败重试次数 默认为3次
})
// 初始化 app.vue或其他位置 获取到uid和tenantId以后 租户id（非多租户的系统 租户id统一为0）

useTrack.setParams({ uid: '2312311', tenantId: '123213' })
```

## 3、在 web 其他后台项目使用

### 3.1 初始化

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
	retryLimit: 3 //自动埋点上报失败重试次数 默认为3次
})
// 初始化 app.vue或其他位置 获取到uid和tenantId以后

useTrack.setParams({ uid: '2312311', tenantId: '123213' })
```

```jsx
// 批量埋点方法

export const sendTracking = async (data: trackParams[]) => {
	// isRaw代表返回原始数据 不直接返回data

	return await request.post({
		url: 'http://47.99.177.100:10998/stat_data_adapter-1.0.0/log/reportOperationLog',
		data,
		isRaw: 'true'
	})
}
useTrackIntance: new useTrack(sendTracking), sendTracking为请求函数
```

### 3.2 手动调用 SDK

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

### 1、目前页面停留时间采用监听 url 的方案 仅支持新项目 或每个路由都配置 meta:{name:xxx}的项目

### 2、已经支持自动监听按钮

如果按钮在 table 里 会将 table 的当前列和表头数据上传

如果按钮在 dialog 弹窗里 会将 dialog 的 label 和对应的 input textArea 值上传

注意!类似 select 的值无法通过 dom 跟踪，只会返回空字符串

### 3、目前手动和自动只能选择一个，后续可以通过设计 auto 字段进行处理或者在 params 中{params:{auto：true}

### 4、如果请求函数方法被二次封装必须确认以下事项

1、如果设置 baseUrl 请修改为判断是否有 http 按条件添加 接口路径支持跨域直接使用即可

```jsx
// baseUrl为基本路径
if (!config.url.includes('http')) {
	config.url = base_url + config.url
}
```

2、如果接口的数据返回也被二次封装，请按 isRaw=’true’ 进行判断返回原始相应体

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
