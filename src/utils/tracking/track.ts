import {
	trackParams,
	trackMutiParams,
	trackClickParams,
	trackErrorParams,
	trackStayParams,
	trackAccessParams
} from './tracking'
import TrackRoute from './trackRoute'

// import { pages } from 'virtual:uni-pages'
// tracking.js 最好在获取uid或获取token的地方做初始化和刷新操作
export default class trackRequest {
	// 设计异步批量请求埋点
	requestList: trackMutiParams[] = []
	trackRouteInstance: TrackRoute | null = null
	intervalTime: number = 5000
	retryLimit: number = 3
	autoUrl: boolean = true

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
		retry: 0,
    platformName: '',
    platformVersion: '',
    machineType: '',
    machineSystemVersion: '',
	}

	params: trackMutiParams = Object.assign({}, this.INITPARAMS)
	paramsKeys: string[] = Object.keys(this.INITPARAMS)
	// 在请求期间触发的埋点，需要等待请求结束再发送
	waitList: trackMutiParams[] = []
	// 是否正在发送请求的标志
	isRequesting: boolean = false

	request: (data: Object) => Promise<{ data: string; msg: string | null; ret: number }> = async () =>
		new Promise(resolve => resolve({ data: '初始化', msg: null, ret: 0 }))

	constructor(request, intervalTime, retryLimit, autoUrl) {
		this.request = request
		this.intervalTime = intervalTime
		this.retryLimit = retryLimit
		this.autoUrl = autoUrl
		this._setTimerToSendRequest()

		this.trackRouteInstance = new TrackRoute()
	}

	// 判断是否为web端
	_isWebEnvironment(): boolean {
		return typeof window !== 'undefined' && typeof window.document !== 'undefined'
	}

	// 初始化参数
	_initParams(): void {
		// 初始化不改动uid 和tenantId  这两个id只受setParams方法改动
		const { uid, tenantId } = this.params
		this.params = Object.assign({}, this.INITPARAMS, { uid, tenantId })
	}

	// 设置参数
	setParams = (params: { uid?: string; tenantId?: string }): void => {
		this.params.uid = params.uid ? params.uid : this.params.uid
		this.params.tenantId = params.tenantId ? params.tenantId : this.params.tenantId
	}

	/**
	 *页面停留的传参方法
	 */
	setStayParams = (params: trackStayParams): void => {
		if (!this.params.uid || !this.params.tenantId) return
		this._getRoute()
		this.params.type = 1
		this.params.eventName = '页面停留'
		// 变量赋值
		Object.keys(params).forEach(item => {
			if (item !== 'uid' && this.paramsKeys.includes(item)) this.params[item] = params[item]
			if (item === 'startTime' || item === 'endTime') {
				this.params[item] = this._formatDate(params[item])
			}
		})
		const obj = Object.assign({}, this.params)
		this.isRequesting ? this.waitList.push(obj) : this.requestList.push(obj)
		// 每次设置都重置参数
		this._initParams()
	}

	/**
	 * 点击事件的传参方法
	 */
	setClickParams = (params: trackClickParams): void => {
		if (!this.params.uid || !this.params.tenantId) return
		// 默认在此处获取URL和路由
		this._getRoute()
		this.params.type = 2
		this.params.startTime = this._formatDate(new Date())
		this.params.endTime = this.params.startTime
		// 变量赋值
		Object.keys(params).forEach(item => {
			if (item !== 'uid' && this.paramsKeys.includes(item)) this.params[item] = params[item]
		})
		const obj = Object.assign({}, this.params)
		this.isRequesting ? this.waitList.push(obj) : this.requestList.push(obj)
		// 每次设置都重置参数
		this._initParams()
	}

	/**
	 *异常事件的传参方法
	 */
	setErrorParams = (params: trackErrorParams): void => {
		if (!this.params.uid || !this.params.tenantId) return
		this._getRoute()
		this.params.type = 3
		this.params.startTime = this._formatDate(new Date())
		this.params.endTime = this.params.startTime
		// 变量赋值
		Object.keys(params).forEach(item => {
			if (item !== 'uid' && this.paramsKeys.includes(item)) this.params[item] = params[item]
		})
		const obj = Object.assign({}, this.params)
		this.isRequesting ? this.waitList.push(obj) : this.requestList.push(obj)
		// 每次设置都重置参数
		this._initParams()
	}

	/**
	 *访问页面的传参方法
	 */
	setAccessParams = (params: trackAccessParams): void => {
		if (!this.params.uid || !this.params.tenantId) return
		this._getRoute()
		this.params.type = 4
		this.params.startTime = this._formatDate(new Date())
		this.params.endTime = this.params.startTime
		// 变量赋值
		Object.keys(params).forEach(item => {
			if (item !== 'uid' && this.paramsKeys.includes(item)) this.params[item] = params[item]
		})
		const obj = Object.assign({}, this.params)
		this.isRequesting ? this.waitList.push(obj) : this.requestList.push(obj)
		// 每次设置都重置参数
		this._initParams()
	}

	// 发送请求
	/**
	 * 每次请求之前都先删除重试过多的接口 保证每个埋点最多重试3次
	 * @returns
	 */
	sendRequest = (): void => {
		// 删除重试次数大于3次的埋点数据
		this._deleteOverTryParam()
		// 未空则不执行
		if (!this.requestList || !this.requestList.length) return
		const requestTempList: trackParams[] = []
		// 删除retry字段 冗余字段，请求接口
		this.requestList.forEach(item => {
			const obj = {}
			Object.keys(item).forEach(key => {
				if (key !== 'retry') obj[key] = item[key]
				// obj[key] = item[key]
			})
			requestTempList.push(obj as trackParams)
		})

		// 执行所有存起来的请求
		// 发送失败则添加重试的次数
		this.isRequesting = true

		this.request(requestTempList)
			.then(res => {
				if (res.ret) {
					this.isRequesting = false
					this.requestList = []
					this.requestList.push(...this.waitList)
					this.waitList = []
				} else {
					// 对当前请求的参数列表进行添加retry的操作 添加完以后，在请求期间触发的埋点参数 放入requestList中
					this._increaseParamsRetry()
					this.isRequesting = false
					this.requestList.push(...this.waitList)
					this.waitList = []
				}
			})
			.catch(() => {
				this._increaseParamsRetry()
				this.isRequesting = false
				this.requestList.push(...this.waitList)
				this.waitList = []
			})
		// uni.request({
		// 	url: this.url + "?" + this.queryString,
		// })
	}

	// 处理发送失败的数据
	_increaseParamsRetry(): void {
		this.requestList.forEach(item => {
			item.retry = item.retry + 1
		})
	}

	// 删除重试次数大于3次的埋点数据
	_deleteOverTryParam(): void {
		this.requestList = this.requestList.filter((item: trackMutiParams) => {
			return item.retry < this.retryLimit
		})
	}

	// 获取当前路由
	_getRoute(): void {
		const flag = this._isWebEnvironment()
		if (!flag) {
			// uniapp支持
			// const pages = getCurrentPages()
			// const page = pages[pages.length - 1]
			// this.params.url = page.route
		} else {
			// web端支持
			this.params.url = window.location.pathname
			if (this.trackRouteInstance && this.autoUrl) {
				if (this._isWebEnvironment()) {
					// H
					const moduleList: string[] = this.trackRouteInstance.getModulesByPath(this.params.url)
					this.params.module = moduleList.length ? moduleList[0] : ''
					this.params.sub_modules = JSON.stringify(moduleList.slice(1))
				} else {
					console.log('in unibest')
				}
			}
		}
	}

	// 定时发送请求列表中的请求
	_setTimerToSendRequest() {
		setInterval(() => {
			// 请求列表不为空就发送
			if (this.requestList.length > 0 && !this.isRequesting) {
				this.sendRequest()
			}
		}, this.intervalTime) // 5秒发送一次请求
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
