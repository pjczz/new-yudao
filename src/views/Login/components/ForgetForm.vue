<template>
  <el-form
ref="formForget" :model="forgetForm" :rules="rules" class="login-form" label-position="top"
    label-width="120px" size="large">
    <el-col :span="24">
      <el-col :span="24">
        <el-form-item>
          <!-- <LoginFormTitle style="width: 100%" /> -->
          <span class="enter-x mb-[44px] text-[40px] text-center w-full  font-bold ">{{
            t('login.fiftyFivekgCloud') }}</span>
        </el-form-item>
      </el-col>

    </el-col>
    <div class="enter-x text-[28px] text-[#244C5E] mb-[50px]">{{
      t('login.findPassword') }}</div>
    <el-row style="margin-right: -10px; margin-left: -10px">
      <!-- 租户名 -->
      <!-- <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <span class="enter-x mb-3 text-center text-2xl font-bold xl:text-center xl:text-3xl">{{ t('login.loginOrRegister') }}</span>
        </el-form-item>
      </el-col> -->
      <!-- 手机号 -->
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="mobileNumber">
          <div class="deep-input w-full">
            <el-input
class="input-class-round" v-model="forgetForm.phone"
              :placeholder="t('login.mobileNumberPlaceholder')" />
          </div>

        </el-form-item>
      </el-col>
      <!-- 验证码 -->
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="code">
          <el-row :gutter="5" justify="space-between" style="width: 100%">
            <el-col :span="18">
              <div class="deep-input w-full">
                <el-input class="input-class-round" v-model="forgetForm.code" :placeholder="t('login.codePlaceholder')">
                  <!-- <el-button class="w-[100%]"> -->

                </el-input>
              </div>

              <!-- </el-button> -->
            </el-col>
            <el-col :span="6">
              <div class="bg-[var(--login-button-color)] h-full text-center rounded-[16px]">
                <span
v-if="mobileCodeTimer <= 0" class="getMobileCode color-white" style="cursor: pointer"
                  @click="getSmsCode">
                  {{ t('login.getSmsCode') }}
                </span>
                <span v-if="mobileCodeTimer > 0" class="getMobileCode" style="cursor: pointer">
                  {{ mobileCodeTimer }}秒后可重新获取
                </span>

              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-col>
      <!-- 登录按钮 / 返回按钮 -->
      <el-col class="rounded-[10px] mt-[20px] mt-[30px]" :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <XButton
:loading="loginLoading" :title="t('login.next')" color="var(--login-button-color)" :round="true"
            class="w-[100%] bg-black  " @click="signIn()" />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { setToken } from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import { sendSmsCode, smsLogin,reqResetPasswordBySms } from '@/api/login'
import { useFormValid } from './useLogin'
import { ElLoading } from 'element-plus'
import { defineEmits } from 'vue'


defineOptions({ name: 'MobileForm' })

const { t } = useI18n()
const message = useMessage()
const permissionStore = usePermissionStore()
const { currentRoute, push } = useRouter()
const formForget = ref()
const loginLoading = ref(false)
const couldSetPassword = ref(false)
const { validForm } = useFormValid(formForget)
const emit = defineEmits(['forgetSuccess'])
const forgetForm = reactive({
  phone: "",
  code: "",
}
)
const rules = {
  tenantName: [required],
  mobileNumber: [required],
  code: [required]
}
const smsVO = reactive({
  smsCode: {
    mobile: '',
    scene: 21
  },
  loginSms: {
    mobile: '',
    code: ''
  }
})
const mobileCodeTimer = ref(0)
const redirect = ref<string>('')
const getSmsCode = async () => {
  smsVO.smsCode.mobile = forgetForm.phone
  await sendSmsCode(smsVO.smsCode).then(async () => {
    message.success(t('login.SmsSendMsg'))
    // 设置倒计时
    mobileCodeTimer.value = 60
    let msgTimer = setInterval(() => {
      mobileCodeTimer.value = mobileCodeTimer.value - 1
      if (mobileCodeTimer.value <= 0) {
        clearInterval(msgTimer)
      }
    }, 1000)
  })
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

// 下一步
const signIn = async () => {
  couldSetPassword.value = true
  if(couldSetPassword){
    emit('forgetSuccess')
    return
  }
  const data = await validForm()
  if (!data) return
  ElLoading.service({
    lock: true,
    text: '正在加载系统中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  loginLoading.value = true
  smsVO.loginSms.mobile = forgetForm.phone
  smsVO.loginSms.code = forgetForm.code
  await reqResetPasswordBySms(smsVO.loginSms)
    .then(async (res) => {
      setToken(res)
      if (!redirect.value) {
        redirect.value = '/'
      }
      push({ path: redirect.value || permissionStore.addRouters[0].path })
    })
    .catch(() => { })
    .finally(() => {
      loginLoading.value = false
      setTimeout(() => {
        const loadingInstance = ElLoading.service()
        loadingInstance.close()
      }, 400)
    })
}
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}

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

:deep(.el-input) {
  .el-input-group__append {
    background-color: var(--login-button-color)
  }
}


.smsbtn {
  margin-top: 33px;
}
</style>
