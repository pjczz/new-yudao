import request from '@/config/axios'

import { trackParams } from '@/types/tracking'



// 批量埋点
export const sendTracking = async (data: trackParams[]) => {
  // isRaw代表返回原始数据
  return await request.post({ url: '/stat_data_adapter_war_exploded/log/reportOperationLog', data , isRaw:true})
}

