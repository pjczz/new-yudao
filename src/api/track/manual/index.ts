import request from '@/config/axios'

import { trackParams } from '@/types/tracking'



// 批量埋点
export const sendTracking = async (data: trackParams[]) => {
  // isRaw代表返回原始数据
  return await request.post({ url: 'http://47.99.177.100:10998/stat_data_adapter-1.0.0/log/reportOperationLog', data , isRaw:true})
}

