import router from '@/router'
import { RouteRecordRaw } from 'vue-router'

export default class trackRoute {
	allRoutes: RouteRecordRaw[] = []
	findRouteMetaTitle(routes, path): string {
		// 遍历路由表，根据path查找匹配的路由
		for (const route of routes) {
			const fullPath: string = `/${route.path}`.replace(/\/+/g, '/') // 标准化路由路径
			if (fullPath === path && route.meta && route.meta.title) {
				return route.meta.title // 如果找到匹配路由，返回meta.title
			}
			// 如果有子路由，递归查找
			if (route.children && route.children.length > 0) {
				const title: string = this.findRouteMetaTitle(route.children, path)
				if (title) return title
			}
		}
		return ''
	}

	// 逐级缩短参数，从长到短，查找路径对应的meta.title，并返回结果数组  如先查/system/tenant/listr然后 /system/tenant  然后 /system
	buildMetaTitleList(routes, fullPath) {
		const parts = fullPath.split('/').filter(Boolean) // 按 / 分割路径并过滤空字符串
		const metaTitleList: string[] = []

		// 逐级缩短路径，从长到短
		for (let i = parts.length; i > 0; i--) {
			const currentPath = '/' + parts.slice(0, i).join('/') // 构建当前要查找的路径
			const title: string = this.findRouteMetaTitle(routes, currentPath) // 查找路径对应的meta.title
			if (title) {
				metaTitleList.unshift(title) // 将找到的title插入结果数组
			}
		}

		return metaTitleList.length ? metaTitleList : ['']
	}

	// 函数：将URL切分为n个部分，并去除 `:` 后面的部分 获取当前的路由
	splitUrl(url) {
		// 1. 删除开头和结尾的斜杠
		const newStr = url.replace(/:\d+(?=\/)/, '')

		return newStr
	}

	// 针对处理yudao框架的路由生成 对应的模块
	getModulesByPath(path: string): string[] {
		// 初始化路由
		if (!(this.allRoutes && this.allRoutes.length)) {
			this.allRoutes = router.getRoutes()
		}
		const modulePath = this.splitUrl(path)
		const res = this.buildMetaTitleList(this.allRoutes, modulePath)
		return res
	}
}
