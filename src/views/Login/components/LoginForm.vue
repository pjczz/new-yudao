<template>
  <el-form
v-show="getShow" ref="formLogin" :model="loginData.loginForm" :rules="LoginRules" class="login-form"
    label-position="top" label-width="120px" size="large">
    <el-col :span="24">
      <el-col :span="24">
        <el-form-item>
          <!-- <LoginFormTitle style="width: 100%" /> -->
          <span class="enter-x mb-3 text-center text-2xl font-bold xl:text-center xl:text-3xl">{{
            t('login.fiftyFivekgCloud') }}</span>
        </el-form-item>
      </el-col>
      <el-form-item>
        <div
class=" text-[16px] font-bold relative color-[#A3A4AC] mr-[20px] cursor-pointer"
          :class="{ active: getLoginState === LoginStateEnum.LOGIN }" @click="setLoginState(LoginStateEnum.LOGIN)">{{
            t('common.password') }}</div>
        <div
class=" text-[16px] font-bold relative color-[#A3A4AC] cursor-pointer"
          :class="{ active: getLoginState === LoginStateEnum.MOBILE }" @click="setLoginState(LoginStateEnum.MOBILE)">
          {{ t('common.verifycode') }}</div>
      </el-form-item>
    </el-col>
    <el-row style="margin-right: -10px; margin-left: -10px">

      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item v-if="loginData.tenantEnable === 'true' && false" prop="tenantName">
          <el-input
v-model="loginData.loginForm.tenantName" :placeholder="t('login.tenantNamePlaceholder')"
            :prefix-icon="iconHouse" link type="primary" />
        </el-form-item>
      </el-col>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="username">
          <div class="deep-input w-full">
            <el-input
class="input-class-round" v-model="loginData.loginForm.username"
              :placeholder="t('login.usernamePlaceholder')" />
          </div>

        </el-form-item>
      </el-col>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="password">
          <div class="deep-input w-full">
            <el-input
class="input-class-round " v-model="loginData.loginForm.password"
              :placeholder="t('login.passwordPlaceholder')" show-password type="password" @keyup.enter="getCode()" />
          </div>
        </el-form-item>
      </el-col>
      <div @click="goForget" class="w-full text-right text-[12px] mr-[14px] text-[#4D73CA] bold cursor-pointer">忘记密码
      </div>
      <!-- <el-col
        :span="24"
        style="padding-right: 10px; padding-left: 10px; margin-top: -20px; margin-bottom: -20px"
      >
        <el-form-item>
          <el-row justify="space-between" style="width: 100%">
            <el-col :span="6">
              <el-checkbox v-model="loginData.loginForm.rememberMe">
                {{ t('login.remember') }}
              </el-checkbox>
            </el-col>
            <el-col :offset="6" :span="12">
              <el-link style="float: right" type="primary">{{ t('login.forgetPassword') }}</el-link>
            </el-col>
          </el-row>
        </el-form-item>
      </el-col> -->
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <XButton
:loading="loginLoading" :title="t('login.login')" class="w-[100%]  mt-[20px]" type="primary"
            color="var(--login-button-color)" :round="true" @click="getCode()" />
        </el-form-item>
      </el-col>

      <Verify
ref="verify" :captchaType="captchaType" :imgSize="{ width: '400px', height: '200px' }" mode="pop"
        @success="handleLogin" />

    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import { ElLoading, ElMessage } from 'element-plus'
import LoginFormTitle from './LoginFormTitle.vue'
import { defineProps } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router'
const props = defineProps({
  agreeCheck: {
    type: Boolean,
    default: false
  }
})

import { useIcon } from '@/hooks/web/useIcon'

import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import * as LoginApi from '@/api/login'
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'

defineOptions({ name: 'LoginForm' })

const { t } = useI18n()
const message = useMessage()
const iconHouse = useIcon({ icon: 'ep:house' })
const iconAvatar = useIcon({ icon: 'ep:avatar' })
const iconLock = useIcon({ icon: 'ep:lock' })
const formLogin = ref()
const { validForm } = useFormValid(formLogin)
const { setLoginState, getLoginState } = useLoginState()
const { currentRoute, push } = useRouter()
const permissionStore = usePermissionStore()
const redirect = ref<string>('')
const loginLoading = ref(false)
const verify = ref()
const captchaType = ref('blockPuzzle') // blockPuzzle 滑块 clickWord 点击文字

const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN)

const LoginRules = {
  tenantName: [required],
  username: [required],
  password: [required]
}
const loginData = reactive({
  isShowPassword: false,
  captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  loginForm: {
    tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
    username: import.meta.env.VITE_APP_DEFAULT_LOGIN_USERNAME || '',
    password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
    captchaVerification: '',
    rememberMe: true // 默认记录我。如果不需要，可手动修改
  }
})

const socialList = [
  { icon: 'ant-design:wechat-filled', type: 30 },
  { icon: 'ant-design:dingtalk-circle-filled', type: 20 },
  { icon: 'ant-design:github-filled', type: 0 },
  { icon: 'ant-design:alipay-circle-filled', type: 0 }
]
const goForget = () => {
  const currentUrl = window.location.href;

  // 将 "/login" 替换为 "/forget"
  const newUrl = currentUrl.replace('/login', '/forget');

  // 在新标签页中打开替换后的 URL
  window.open(newUrl, '_blank');
}
// 获取验证码
const getCode = async () => {
  if (!props.agreeCheck) {
    ElMessage.error(t('login.agreeUserAgreement'))
    return
  }
  // 情况一，未开启：则直接登录
  if (loginData.captchaEnable === 'false') {
    await handleLogin({})
  } else {
    // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行登录
    // 弹出验证码
    verify.value.show()
  }
}
// 获取租户 ID
const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    const res = await LoginApi.getTenantIdByName(loginData.loginForm.tenantName)
    authUtil.setTenantId(res)
  }
}
// 记住我
const getLoginFormCache = () => {
  const loginForm = authUtil.getLoginForm()
  if (loginForm) {
    loginData.loginForm = {
      ...loginData.loginForm,
      username: loginForm.username ? loginForm.username : loginData.loginForm.username,
      password: loginForm.password ? loginForm.password : loginData.loginForm.password,
      rememberMe: loginForm.rememberMe,
      tenantName: loginForm.tenantName ? loginForm.tenantName : loginData.loginForm.tenantName
    }
  }
}
// 根据域名，获得租户信息
const getTenantByWebsite = async () => {
  const website = location.host
  const res = await LoginApi.getTenantByWebsite(website)
  if (res) {
    loginData.loginForm.tenantName = res.name
    authUtil.setTenantId(res.id)
  }
}
const loading = ref() // ElLoading.service 返回的实例
// 登录
const handleLogin = async (params) => {
  loginLoading.value = true
  try {
    await getTenantId()
    const data = await validForm()
    if (!data) {
      return
    }
    const loginDataLoginForm = { ...loginData.loginForm }
    loginDataLoginForm.captchaVerification = params.captchaVerification
    const res = await LoginApi.login(loginDataLoginForm)
    if (!res) {
      return
    }
    loading.value = ElLoading.service({
      lock: true,
      text: '正在加载系统中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    if (loginDataLoginForm.rememberMe) {
      authUtil.setLoginForm(loginDataLoginForm)
    } else {
      authUtil.removeLoginForm()
    }
    authUtil.setToken(res)
    if (!redirect.value) {
      redirect.value = '/'
    }
    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      push({ path: redirect.value || permissionStore.addRouters[0].path })
    }
  } finally {
    loginLoading.value = false
    loading.value.close()
  }
}

// 社交登录
const doSocialLogin = async (type: number) => {
  if (type === 0) {
    message.error('此方式未配置')
  } else {
    loginLoading.value = true
    if (loginData.tenantEnable === 'true') {
      // 尝试先通过 tenantName 获取租户
      await getTenantId()
      // 如果获取不到，则需要弹出提示，进行处理
      if (!authUtil.getTenantId()) {
        try {
          const data = await message.prompt('请输入租户名称', t('common.reminder'))
          if (data?.action !== 'confirm') throw 'cancel'
          const res = await LoginApi.getTenantIdByName(data.value)
          authUtil.setTenantId(res)
        } catch (error) {
          if (error === 'cancel') return
        } finally {
          loginLoading.value = false
        }
      }
    }
    // 计算 redirectUri
    // tricky: type、redirect需要先encode一次，否则钉钉回调会丢失。
    // 配合 Login/SocialLogin.vue#getUrlValue() 使用
    const redirectUri =
      location.origin +
      '/social-login?' +
      encodeURIComponent(`type=${type}&redirect=${redirect.value || '/'}`)

    // 进行跳转
    const res = await LoginApi.socialAuthRedirect(type, encodeURIComponent(redirectUri))
    window.location.href = res
  }
}
watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)
onMounted(() => {
  getLoginFormCache()
  getTenantByWebsite()
})
</script>

<style lang="scss" scoped>
:deep(.anticon) {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}

.active {
  color: var(--login-button-color);
}

.active::after {
  position: absolute;
  bottom: 0;
  left: 3%;
  width: 96%;
  height: 2px;
  background-color: var(--login-button-color);
  content: ""
}

.login-code {
  float: right;
  width: 100%;
  height: 38px;

  img {
    width: 100%;
    height: auto;
    max-width: 100px;
    vertical-align: middle;
    cursor: pointer;
  }
}
</style>
<style lang="scss">
/* 自定义复选框颜色和圆角 */
.custom-checkbox .el-checkbox__input {
  /* 如果需要改变选中时的背景色 */
  border-color: #fff;
  /* 自定义颜色 */
  border-radius: 10px;
  /* 圆角大小 */
}

/* 自定义复选框为选中状态时的颜色 */
.custom-checkbox .el-checkbox__input .el-checkbox__inner:hover {
  background-color: var(--login-button-color);
  border-color: var(--login-button-color);
}

/* 自定义复选框为选中状态时的对勾颜色 */
.custom-checkbox .el-checkbox__input .el-checkbox__inner::after {
  background-color: var(--login-button-color);
  border-color: #fff;
  /* 对勾颜色 */
}

.custom-checkbox .el-checkbox__input .el-checkbox__inner {
  background-color: #fff;
  border: 1px solid;
  border-radius: 100%;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: var(--login-button-color);
  border-color: var(--login-button-color);
}

.deep-input {
  border-radius: 100%
}

.input-class-round {
  display: flex;
  align-items: center;
}

.input-class-round .el-input-group__prepend {
  border: 0;
  border-radius: 16px;
  box-shadow: 0 0 0 0;
}

.input-class-round .el-input-group__prepend {
  border: 0;
  border-radius: 30px;
  box-shadow: 0 0 0 0;
}

.input-class-round .el-input__inner {
  padding-left: 20px;
}

.input-class-round .el-input__wrapper {
  background: #EEF0F8;
  border: 0;
  border-radius: 16px;
  box-shadow: 0 0 0 0;
}

.input-class-round .el-input-group__append {
  border: 0;
  border-radius: 30px;
  box-shadow: 0 0 0 0;
}
</style>
