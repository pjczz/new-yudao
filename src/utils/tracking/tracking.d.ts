export interface trackParams {
  project: string // 项目名称
  system: string
  module: string
  sub_modules: string
  tenantId: string | null
  uid: string | null
  type: number
  startTime: string
  endTime: string
  eventName: string
  eventRes: string
  url: string
  params: string
  remarks: string
}
export interface trackInputParams {
  project: string // 项目名称
  system: string
  module: string
  sub_modules: string
  tenantId: string | null
  uid: string | null
  type: number
  startTime: Date
  endTime: Date
  eventName: string
  eventRes: string
  url: string
  params: string
  remarks: string
}

export interface trackMutiParams extends trackParams {
  retry: number
  remarks: string
}

export interface trackClickParams { // 点击事件
  eventName: string
  remarks?: string
  params?: string
  module?: string
  sub_modules?: string
  url?:string
}

export interface trackErrorParams { // 错误
  eventName?: string
  eventRes: string
  params: string
  remarks?: string
  module?: string
  sub_modules?: string
  url?:string
}

export interface trackStayParams { // 停留
  url?: string
  startTime: Date
  endTime: Date
  remarks?: string
  module?: string
  sub_modules?: string
  url?:string
}
// 访问
export interface trackAccessParams extends trackStayParams
{}
