import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useUserStore from '../store/userStore'
import useUiStore from '../store/uiStore'

/**
 * 로그인 모달 컴포넌트
 */
function LoginModal() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useUserStore()
  const { showLoginModal, setShowLoginModal, setShowRegisterModal } =
    useUiStore()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (showLoginModal) {
      setFormData({ username: '', password: '' })
      setErrors({})
    }
  }, [showLoginModal])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = t('Username_Required')
    }
    if (!formData.password) {
      newErrors.password = t('Password_Required')
    } else if (formData.password.length < 6 || formData.password.length > 20) {
      newErrors.password = t('Password_Length_Error')
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // 입력 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const result = await login(formData.username, formData.password)
      if (result.success) {
        setShowLoginModal(false)
        alert(t('Welcome_Back'))
      } else {
        alert(result.error || t('Login_Failed'))
      }
    } catch (error) {
      console.error('Login error:', error)
      alert(t('Login_Failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const handleClose = () => {
    setShowLoginModal(false)
  }

  const handleSwitchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleForgotPassword = () => {
    setShowLoginModal(false)
    navigate('/apply-reset-password')
  }

  if (!showLoginModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('Login')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 사용자명 */}
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={t('LoginUsername')}
              autoFocus
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                errors.username
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={t('LoginPassword')}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                errors.password
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('Loading') : t('Login')}
          </button>

          {/* 링크 */}
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-gray-600 dark:text-gray-400 hover:text-primary transition"
            >
              {t('Forget_Password')}
            </button>
            <button
              type="button"
              onClick={handleSwitchToRegister}
              className="text-gray-600 dark:text-gray-400 hover:text-primary transition"
            >
              {t('No_Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
