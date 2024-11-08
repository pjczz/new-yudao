<template>
  <el-form
    ref="formForget"
    :model="forgetForm"
    :rules="rules"
    class="login-form w-[480px]"
    label-position="top"
    label-width="120px"
    size="large"
  >
    <el-col :span="24">
      <el-col :span="24">
        <el-form-item>
          <!-- <LoginFormTitle style="width: 100%" /> -->
          <span class="enter-x mb-[44px] text-[40px] text-center w-full font-bold">{{
            t('login.fiftyFivekgCloud')
          }}</span>
        </el-form-item>
      </el-col>
    </el-col>
    <div class="enter-x text-[28px] text-[#244C5E] mb-[50px]">{{ t('login.setNewPassword') }}</div>
    <el-row style="margin-right: -10px; margin-left: -10px">
      <!-- 租户名 -->
      <!-- <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <span class="enter-x mb-3 text-center text-2xl font-bold xl:text-center xl:text-3xl">{{ t('login.loginOrRegister') }}</span>
        </el-form-item>
      </el-col> -->
      <!-- 手机号 -->
      <!-- 验证码 -->
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="password">
          <div class="deep-input w-full">
            <el-input
              class="input-class-round"
              v-model="forgetForm.password"
              :placeholder="t('login.passwordPlaceholder')"
              show-password
              type="password"
            />
          </div>
        </el-form-item>
      </el-col>
      <!-- 登录按钮 / 返回按钮 -->
      <div class="text-[#333333] text-[14px] mt-[0px] ml-[10px]"
        >8-20位字符，至少包含字母，数字、特珠字符中的两种</div
      >
      <el-col
        class="rounded-[10px] mt-[30px]"
        :span="24"
        style="padding-right: 10px; padding-left: 10px"
      >
        <el-form-item>
          <XButton
            :loading="loginLoading"
            :title="t('login.done')"
            color="var(--login-button-color)"
            :round="true"
            class="w-[100%] bg-black"
            @click="signIn()"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { defineEmits } from 'vue'
import { validatePassword } from '@/utils/validate'
import { useI18n } from 'vue-i18n'
import { reqResetPassword } from '@/api/login'
defineOptions({ name: 'MobileForm' })

const { t } = useI18n()
const { currentRoute, push } = useRouter()
const formForget = ref()
const loginLoading = ref(false)
const emit = defineEmits(['afterSetPassword'])
const forgetForm = reactive({
  password: ''
})
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error(t('login.pleaseInputPassword')))
  } else if (!validatePassword(value)) {
    callback(new Error(t('login.pleaseInputCorrectPassword')))
  } else {
    callback()
  }
}
const rules = {
  password: [
    { required: true, message: t('login.pleaseInputPassword') },
    { validator: validatePass, trigger: 'blur' }
  ]
}
const redirect = ref<string>('')
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
  emit('afterSetPassword')
  reqResetPassword({ password: forgetForm.password }).then((res) => {
    if (res.code == 200) {
      // 请求修改密码
      emit('afterSetPassword')
      ElMessage.success('密码修改成功')
    }
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
  content: '';
}

:deep(.el-input) {
  .el-input-group__append {
    background-color: var(--login-button-color);
  }
}

.smsbtn {
  margin-top: 33px;
}
</style>
