import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 비밀번호 재설정 신청 페이지
 * 이메일과 캡챠를 입력받아 비밀번호 재설정 이메일을 발송합니다.
 */
function ApplyResetPassword() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    captcha: '',
  })
  const [captchaSrc, setCaptchaSrc] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCaptcha()
  }, [])

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

    if (!formData.email) {
      newErrors.email = t('Email_Required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.captcha) {
      newErrors.captcha = t('Captcha_Required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 비밀번호 재설정 이메일을 발송합니다.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await api.applyResetPassword(formData)

      // 성공 시 약간의 지연 후 성공 메시지 표시
      setTimeout(() => {
        setLoading(false)
        setSuccess(true)
      }, 2000)
    } catch (error) {
      setLoading(false)
      setFormData((prev) => ({ ...prev, captcha: '' }))
      loadCaptcha()

      // 에러 메시지 표시
      if (error.response?.data?.data) {
        alert(error.response.data.data)
      } else {
        alert(t('Password_Reset_Request_Failed'))
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
                <h3 className="font-bold mb-2">성공</h3>
                <p className="text-sm">
                  {t('Password_Reset_Email_Sent')}
                  이메일을 확인해주세요.
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
          {/* 이메일 입력 */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('Email_Placeholder')}
              className={`w-full px-4 py-3 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.email ? 'border-red-500' : 'border-input'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* 캡챠 입력 */}
          <div>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  name="captcha"
                  value={formData.captcha}
                  onChange={handleChange}
                  placeholder="캡챠를 입력하세요"
                  className={`w-full px-4 py-3 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
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
            {loading ? t('Sending') : t('Send_Password_Reset_Button')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ApplyResetPassword
