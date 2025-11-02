import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 비밀번호 재설정 페이지
 * 이메일로 받은 토큰을 사용하여 새 비밀번호를 설정합니다.
 */
function ResetPassword() {
  const { t } = useTranslation()
  const { token } = useParams()

  const [formData, setFormData] = useState({
    password: '',
    passwordAgain: '',
    captcha: '',
    token: '',
  })
  const [captchaSrc, setCaptchaSrc] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData((prev) => ({ ...prev, token }))
    loadCaptcha()
  }, [token])

  /**
   * 캡챠 이미지를 불러옵니다.
   */
  const loadCaptcha = () => {
    setCaptchaSrc(`/api/captcha?${Date.now()}`)
  }

  /**
   * 폼 입력값을 업데이트합니다.
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * 폼 유효성을 검사합니다.
   */
  const validateForm = () => {
    const newErrors = {}

    if (!formData.password) {
      newErrors.password = t('Password_Required')
    } else if (formData.password.length < 6 || formData.password.length > 20) {
      newErrors.password = t('Password_Length_Error')
    }

    if (!formData.passwordAgain) {
      newErrors.passwordAgain = t('Password_Confirm_Required')
    } else if (formData.password !== formData.passwordAgain) {
      newErrors.passwordAgain = t('Password_Not_Match')
    }

    if (!formData.captcha) {
      newErrors.captcha = t('Captcha_Required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 비밀번호를 재설정합니다.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      // passwordAgain은 제외하고 전송
      const { passwordAgain, ...dataToSend } = formData
      await api.resetPassword(dataToSend)

      setLoading(false)
      setSuccess(true)
    } catch (error) {
      setLoading(false)
      setFormData((prev) => ({ ...prev, captcha: '' }))
      loadCaptcha()

      // 에러 메시지 표시
      if (error.response?.data?.data) {
        alert(error.response.data.data)
      } else {
        alert(t('Password_Reset_Failed'))
      }
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="bg-card rounded-lg shadow-lg border border-border p-8 max-w-md w-full">
          <div className="bg-green-100 dark:bg-green-950 border border-green-500 text-green-700 dark:text-green-400 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-bold mb-2">비밀번호 재설정 완료</h3>
                <p className="text-sm">
                  비밀번호가 성공적으로 재설정되었습니다.
                  새 비밀번호로 로그인해주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="bg-card rounded-lg shadow-lg border border-border p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-foreground mb-6">
          비밀번호 재설정
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 비밀번호 입력 */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="새 비밀번호 (6~20자)"
                className={`w-full pl-10 pr-4 py-3 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.password ? 'border-red-500' : 'border-input'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 입력 */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                type="password"
                name="passwordAgain"
                value={formData.passwordAgain}
                onChange={handleChange}
                placeholder={t('Password_Confirm_Placeholder')}
                className={`w-full pl-10 pr-4 py-3 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.passwordAgain ? 'border-red-500' : 'border-input'
                }`}
              />
            </div>
            {errors.passwordAgain && (
              <p className="text-red-500 text-sm mt-1">{errors.passwordAgain}</p>
            )}
          </div>

          {/* 캡챠 입력 */}
          <div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  name="captcha"
                  value={formData.captcha}
                  onChange={handleChange}
                  placeholder={t('Captcha_Placeholder')}
                  className={`w-full pl-10 pr-4 py-3 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.captcha ? 'border-red-500' : 'border-input'
                  }`}
                />
              </div>
              <div className="flex-shrink-0">
                <img
                  src={captchaSrc}
                  alt="captcha"
                  onClick={loadCaptcha}
                  className="h-12 w-32 border border-border rounded cursor-pointer hover:opacity-80 transition"
                  title="클릭하여 새로고침"
                />
              </div>
            </div>
            {errors.captcha && (
              <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? t('Resetting') : t('Reset_Password_Button')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
