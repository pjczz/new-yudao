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
export interface trackMutiParams extends trackParams {
  retry: number
}
