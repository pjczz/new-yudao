import type { App } from 'vue'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { t } = useI18n() // 国际化

export function hasPermi(app: App<Element>) {
  app.directive('hasPermi', (el, binding) => {
    const { wsCache } = useCache()
    const { value } = binding
    const all_permission = '*:*:*'
    const permissions = wsCache.get(CACHE_KEY.USER).permissions

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value
      // 判断逻辑，输入的是一个权限字符串数组，便利账号里的权限，如果存在一个权限与输入的权限数组中的一个权限相同，则有权限
      // 也就是说 输入的权限数组是只要存在一个权限存在，就可以通过，代表的是或
      // 优化方法一 统计法，统计最终true的个数是否等于输入列表
      // 优化方法二
      const hasPermissions = permissions.some((permission: string) => {
        return all_permission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(t('permission.hasPermission'))
    }
  })
}
