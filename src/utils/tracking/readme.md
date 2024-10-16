# 埋点文件使用
## 1、目前支持浏览器环境

## 2、埋点文件初始化依赖于传入请求函数

```jsx
// 批量埋点

export const sendTracking = async (data: trackParams[]) => {

// isRaw代表返回原始数据 不直接返回data

return await request.post({ url: '/stat_data_adapter_war_exploded/log/reportOperationLog', data , isRaw:true})

}
useTrackIntance: new useTrack(sendTracking), sendTracking为请求函数
```

## 3、埋点类初始化

目前埋点类初始化依赖于strore 在store中初始化  然后在全局调用

为保证请求队列，类全局只能初始化一次

```jsx
import { store } from '@/store'

import { defineStore } from 'pinia'

import { getAccessToken, removeToken } from '@/utils/auth'

import { CACHE_KEY, useCache, deleteUserCache } from '@/hooks/web/useCache'

import { getInfo, loginOut } from '@/api/login'

import { useTrack } from '@/utils/tracking/tracking'

import { sendTracking } from '@/api/track/manual'

const { wsCache } = useCache()

interface UserVO {

id: number

avatar: string

nickname: string

deptId: number

}

interface UserInfoVO {

<!-- ... -->
useTrackIntance: useTrack

}

export const useUserStore = defineStore('admin-user', {

state: (): UserInfoVO => ({

permissions: [],

roles: [],

isSetUser: false,

user: {

id: 0,

avatar: '',

nickname: '',

deptId: 0

},

useTrackIntance: new useTrack(sendTracking),

}),

getters: {

getUseTrackIntance(): useTrack{

return this.useTrackIntance

},

<!-- ... -->

},

actions: {
<!-- ... -->

}

})

export const useUserStoreWithOut = () => {

return useUserStore(store)

}
```

3、埋点文件使用

import { useTrackIntance } from '@/utils/tracking'

import { useTrack } from '@/utils/tracking/useTrack'

const track = useTrackIntance()

<!-- 有三个暴露的方法 setStayParams setClickParams setErrorParams -->

track.sendTracking({

// 埋点参数

// ...

})

下面是传参的interface类型

export interface trackClickParams { // 点击事件

eventName: string

remarks?: string

}

export interface trackErrorParams { // 错误

eventName?: string

eventRes: string

params: string

remarks?: string

}

export interface trackStayParams { // 错误

url?: string

startTime: Date

endTime: Date

remarks?: string

}

4、目前页面停留时间采用的路由拦截器的方案，未来会改成监听url的方案