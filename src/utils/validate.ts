export function validatePassword(password: string): boolean {
  // 检查长度是否在 8 到 20 之间
  if (!/^[a-zA-Z\d\W]{8,20}$/.test(password)) {
    return false
  }

  // 检查是否包含字母
  const hasLetter: boolean = /[a-zA-Z]/.test(password)
  // 检查是否包含数字
  const hasDigit: boolean = /\d/.test(password)
  // 检查是否包含特殊字符
  const hasSpecialChar: boolean = /[\W_]/.test(password)

  // 至少包含字母、数字、特殊字符中的两种
  const validCount: number = [hasLetter, hasDigit, hasSpecialChar].filter(Boolean).length

  return validCount >= 2
}
