<template>
  <div :class="prefixCls" class="relative h-[100%] lt-md:px-10px lt-sm:px-10px">
    <div class="relative mx-auto h-full flex">
      <div
        :class="`${prefixCls}__left flex-1 bg-gray-500 bg-opacity-20 2xl:w-[100%]  left-background relative  overflow-x-hidden overflow-y-auto`"
      >
        <!-- 左上角的 logo + 系统标题 -->
        <!-- 左边的背景图 + 欢迎语 -->
        <div class="h-[100%] flex items-center justify-center">
          <TransitionGroup
            appear
            enter-active-class="animate__animated animate__bounceInLeft"
            tag="div"
          />
        </div>
      </div>
      <div
        class="absolute forget translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%] h-[800px] rounded-[16px] flex flex-col w-auto bg-white items-center 2xl:w-[52%] dark:bg-none lt-xl:w-full overflow-x-hidden overflow-y-auto"
      >
        <!-- 右边的登录界面 -->
        <Transition appear enter-active-class="animate__animated animate__bounceInRight">
          <div class="flex py-[56px] w-[486px] max-w-[486px] flex-col items-center">
            <img alt="" class="ml-12px h-100px w-100px mb-[28px]" src="@/assets/imgs/logo.png" />
            <ForgetForm v-if="!couldSetPassword" @forget-success="handleForgetSuccess" />
            <SetPasswordForm v-else @after-set-password="handleSuccess" />
            <!-- 三方登录 -->
            <SSOLoginVue class="h-auto p-20px lt-xl:(rounded-3xl light:bg-white)" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { underlineToHump } from '@/utils'

import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/store/modules/app'
import { ThemeSwitch } from '@/layout/components/ThemeSwitch'
import { LocaleDropdown } from '@/layout/components/LocaleDropdown'
import router from '@/router'
import { SSOLoginVue } from './components'
import ForgetForm from './components/ForgetForm.vue'
import SetPasswordForm from './components/SetPasswordForm.vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'Login' })
const { t } = useI18n()
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('login')
const couldSetPassword = ref(false)
const route = useRoute()
const handleForgetSuccess = () => {
  couldSetPassword.value = true
}
const handleSuccess = () => {
  let path = '/login'
  if (route.query.redirect) {
    path = path + '?redirect=' + route.query.redirect
  }
  router.push(path)
}
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-login;

a {
  text-decoration: none;
}

.forget {
  box-shadow: 0 20px 40px 0 rgb(55 137 248 / 20%);
}
.#{$prefix-cls} {
  overflow: auto;

  &__left {
    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      background-image: url('@/assets/svgs/login-bg.svg');
      background-position: center;
      background-repeat: no-repeat;
      content: '';
    }
  }
}
</style>

<style lang="scss">
.left-background {
  background: url('../../assets/imgs/login-left-background.png') no-repeat;
  background-size: 100% 100%;
}

.dark .login-form {
  .el-divider__text {
    background-color: var(--login-bg-color);
  }

  .el-card {
    background-color: var(--login-bg-color);
  }
}
</style>
