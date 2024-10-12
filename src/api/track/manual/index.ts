import request from '@/config/axios'

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
export interface trackResponse extends trackParams {
  id: string | null
}

// 普通埋点
export const sendTracking = async (data: trackParams) => {
  return await request.post({ url: '/track', data })
}

// 批量埋点
export const sendTrackingMuti = async (data: trackParams[]) => {
  return await request.post({ url: '/system/area/get-by-ip?ip=', data })
}
