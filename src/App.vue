<script lang="ts" setup>
import { isDark } from '@/utils/is'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import routerSearch from '@/components/RouterSearch/index.vue'
import { onBeforeUnmount, onMounted } from 'vue'
import {useUserStore} from '@/store/modules/user'
defineOptions({ name: 'APP' })

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('app')
const appStore = useAppStore()
const currentSize = computed(() => appStore.getCurrentSize)
const greyMode = computed(() => appStore.getGreyMode)
const { wsCache } = useCache()

// 根据浏览器当前主题设置系统主题色
const setDefaultTheme = () => {
  let isDarkTheme = wsCache.get(CACHE_KEY.IS_DARK)
  if (isDarkTheme === null) {
    isDarkTheme = isDark()
  }
  appStore.setIsDark(isDarkTheme)
}
setDefaultTheme()
onMounted(() => {
  const userStoreTrack = useUserStore()
  const useTrack = userStoreTrack.getUseTrackIntance
  useTrack.setParams({ uid: '2312311', tenantId: '123213' })
  // window.addEventListener('click', function (e) {
  //   console.log(e)
  // })
  window.addEventListener('unhandledrejection', event => {
    useTrack.setErrorParams({
      // url: to.path,
      eventRes: event.reason,
      params: JSON.stringify({
        params: {},
        data: {}
      }),
      remarks: ''
    })
    // 在这里可以进行上报处理
  });
})
onBeforeUnmount(() => {
  // app销毁时清除所有请求
  const userStoreTrack = useUserStore()
  const useTrack = userStoreTrack.getUseTrackIntance
  useTrack.clearAllRequests()
  
})

</script>
<template>
  <ConfigGlobal :size="currentSize">
    <RouterView :class="greyMode ? `${prefixCls}-grey-mode` : ''" />
    <routerSearch />
  </ConfigGlobal>
</template>
<style lang="scss">
$prefix-cls: #{$namespace}-app;

.size {
  width: 100%;
  height: 100%;
}

html,
body {
  @extend .size;

  padding: 0 !important;
  margin: 0;
  overflow: hidden;

  #app {
    @extend .size;
  }
}

.#{$prefix-cls}-grey-mode {
  filter: grayscale(100%);
}
</style>
