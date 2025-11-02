import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import adminApi from '../../api/admin'
import useAdminStore from '../../store/adminStore'
import { handleApiError } from '../../utils/errorHandler'

/**
 * Admin 로그인 페이지
 */
function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { adminLogin } = useAdminStore()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('') // 전역 에러 메시지

  /**
   * 폼 입력값 변경 핸들러
   */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    // 전역 에러 메시지도 제거
    if (errorMessage) {
      setErrorMessage('')
    }
  }

  /**
   * 폼 유효성 검사
   */
  const validateForm = () => {
    const newErrors = {}

    if (!formData.username) {
      newErrors.username = t('Username_Required')
    }

    if (!formData.password) {
      newErrors.password = t('Password_Required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 로그인 제출
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setErrorMessage('') // 이전 에러 메시지 초기화

      // 로그인 요청 (세션 생성)
      await adminApi.login(formData.username, formData.password)

      // 로그인 성공 후 프로필 정보 조회
      const profileResponse = await adminApi.getProfile()
      const userData = profileResponse.data

      // 관리자 정보 저장 (토큰은 세션 쿠키로 관리)
      adminLogin(userData, null)

      // 대시보드로 이동
      navigate('/admin/dashboard')
    } catch (error) {
      // 구체적인 에러 메시지 추출 및 표시
      const message = handleApiError('Admin Login', error, t('Login_Failed'))
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Enter 키 핸들러
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* 로그인 카드 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          {/* 로고 및 타이틀 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('Admin_Login')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Admin_Login_Description')}
            </p>
          </div>

          {/* 에러 메시지 표시 */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                    {t('Login_Error')}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 사용자명 입력 */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('Username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                  errors.username
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('Username_Placeholder')}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('Password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                  errors.password
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={t('Password_Placeholder')}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('Logging_In')}
                </span>
              ) : (
                t('Login')
              )}
            </button>
          </form>

          {/* 추가 링크 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-primary hover:text-primary/80 transition"
            >
              {t('Back_To_Homepage')}
            </button>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Code Place. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
