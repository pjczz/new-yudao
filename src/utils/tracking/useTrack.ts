import trackRequest from './trackRequest'
import { App } from 'vue'
export default class useTrack extends trackRequest {
	enterTime: Date = new Date()
	isWeb: boolean = false
	app: App | null = null
	constructor({
		request,
		app,
		autoUrl = true,
		autoClick = true,
		autoError = true,
		autoStay = true,
		intervalTime = 5000,
		retryLimit = 3
	}) {
		super(request, intervalTime, retryLimit, autoUrl)
		this.app = app
		console.log(app.version, 'app.version')
		this.isWeb = super._isWebEnvironment()
		// 开启url监听并上传
		autoStay && this.isWeb ? this.listenUrlChange() : console.log('启用手动监听路由')
		// 开启点击监听
		autoClick && this.isWeb ? this.listenClick() : console.log('启用手动监听点击')
		// 开启错误监听
		autoError && this.isWeb ? this.listenError() : console.log('启用手动监听错误')
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

			let clickName = ''
			let params = JSON.stringify({ params: {}, data: {} })
			// 必须点击的元素是按钮或者他的父元素是按钮（点到文字时）
			if (e.target) {
				if (target.tagName === 'BUTTON' && trackableChildren) {
					clickName = trackableChildren.innerText
				} else if (trackableParent && trackableParent.tagName === 'BUTTON') {
					clickName = trackableParent.querySelector('span')?.innerText || 'sb'
				} else {
					return
				}
				// 点击在table中 或者在 dialog中
				const table = target.closest('.el-table')
				if (table) {
					params = this._getTabelClick(target) || params
				} else {
					params = this._getDialogClick(target) || params
				}

				this.setClickParams({
					eventName: clickName,
					params
				})
			}
		})
	}

	// unhandledrejection
	listenError() {

		window.addEventListener('unhandledrejection', event => {
      console.log('没捕获到的',event)
			this.setErrorParams({
				// url: to.path,
				eventRes: event.reason?.message ||  event.reason,
				params: JSON.stringify({
					params: {},
					data: {}
				}),
				remarks: ''
			})
			// 在这里可以进行上报处理
		})
		// vue3 专属 vue2 需要验证  捕获全局错误
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
	// 获取表格中的数据 如果点击的是表格的话

	_getTabelClick(target): string | null {
		const threadList: string[] = []
		const selectList: string[] = []
		const dataList: { key: string; value: string }[] = []
		const table = target.closest('.el-table')
		// 处理表格中的编辑
		if (table) {
			// 点击行的所有参数
			const childNodes: NodeListOf<ChildNode> | undefined = target.closest('tr')?.childNodes
			// 获取表头
			const thread: HTMLElement = table.querySelector('.el-table thead tr')

			if (childNodes) {
				Array.from(childNodes).forEach((child: HTMLElement) => {
					if (child) {
						selectList.push(child.innerText)
					}
				})
			}
			// 获取表头的列表
			if (thread) {
				Array.from(thread.childNodes).forEach((child: HTMLElement) => {
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
			return JSON.stringify({ params: {}, data: dataList.length > 0 ? dataList : {} })
		}
		return null
	}

	// 获取弹窗表单的数据
	_getDialogClick(target): string | null {
		const dataList: { key: string; value: string }[] = []
		const dialog = target.closest('.el-dialog')
		const dialogBody = dialog?.querySelector('.el-dialog__body')
		// 处理表格中的编辑
		if (dialogBody) {
			// 点击行的所有参数
			const form: HTMLElement = dialogBody.querySelector('form')

			// 获取所有的表单元素
			const labels = form.querySelectorAll('label')

			labels.forEach(label => {
				// 获取关联的 label
				// const label = form.querySelector(`label[for="${input.id}"]`)
				const id = label.getAttribute('for')
				if (label && id) {
					dataList.push({
						key: label.textContent || '',
						value: form.querySelector(`#${id}`)?.value || ''
					})
					// console.log(`Label: ${label.textContent}, Value: ${input.value}`)
				}
			})

			return JSON.stringify({ params: {}, data: dataList.length > 0 ? dataList : {} })
		}
		return null
	}
}
