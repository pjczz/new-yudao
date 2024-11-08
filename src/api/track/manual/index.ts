import request from '@/config/axios'

import { trackParams } from '@/types/tracking'



// 批量埋点
export const sendTracking = async (data: trackParams[]) => {
  // isRaw代表返回原始数据
  return await request.post({ url: 'http://tracking.tbit.com.cn:9090/adapter/log/reportOperationLog', data , isRaw:true})
}

