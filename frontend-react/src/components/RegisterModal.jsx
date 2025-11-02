import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useUserStore from '../store/userStore'
import useUiStore from '../store/uiStore'
import api from '../api'

/**
 * 회원가입 모달 컴포넌트
 */
function RegisterModal() {
  const { t } = useTranslation()
  const { register } = useUserStore()
  const { showRegisterModal, setShowRegisterModal, setShowLoginModal } =
    useUiStore()

  const PUSAN_DOMAIN = '@pusan.ac.kr'

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    real_name: '',
    student_id: '',
    collegeId: '',
    departmentId: '',
    password: '',
    passwordAgain: '',
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // 이메일 인증 관련
  const [emailAuthCodeInputState, setEmailAuthCodeInputState] = useState(false)
  const [emailAuthCodeVerifyCompletedState, setEmailAuthCodeVerifyCompletedState] = useState(false)
  const [authCode, setAuthCode] = useState('')

  // 대학/학과 목록
  const [collegeList, setCollegeList] = useState([])
  const [departmentList, setDepartmentList] = useState([])

  // 모달이 열릴 때 초기화 및 대학 목록 로드
  useEffect(() => {
    if (showRegisterModal) {
      resetForm()
      loadCollegeList()
    }
  }, [showRegisterModal])

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      real_name: '',
      student_id: '',
      collegeId: '',
      departmentId: '',
      password: '',
      passwordAgain: '',
    })
    setErrors({})
    setEmailAuthCodeInputState(false)
    setEmailAuthCodeVerifyCompletedState(false)
    setAuthCode('')
    setShowPassword(false)
  }

  const loadCollegeList = async () => {
    try {
      const response = await api.getCollegeList()
      setCollegeList(response.data || [])
    } catch (error) {
      console.error('Failed to load college list:', error)
    }
  }

  const loadDepartmentList = async (collegeId) => {
    try {
      const response = await api.getDepartmentList(collegeId)
      setDepartmentList(response.data || [])
    } catch (error) {
      console.error('Failed to load department list:', error)
    }
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

  const handleCollegeChange = (e) => {
    const collegeId = e.target.value
    setFormData((prev) => ({
      ...prev,
      collegeId,
      departmentId: '', // 단과대학 변경 시 학과 초기화
    }))
    if (collegeId) {
      loadDepartmentList(collegeId)
    } else {
      setDepartmentList([])
    }
  }

  const handleDepartmentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      departmentId: e.target.value,
    }))
  }

  // 이메일 인증 요청
  const handleEmailAuth = async () => {
    if (!formData.email.trim()) {
      alert(t('Email_Required'))
      return
    }

    try {
      const fullEmail = formData.email + PUSAN_DOMAIN
      await api.applyEmailValidation(fullEmail)
      alert(t('Email_Verification_Sent'))
      setEmailAuthCodeInputState(true)
    } catch (error) {
      if (error.status === 400) {
        alert(t('Email_Already_Exists'))
      } else {
        alert(t('Email_Verification_Failed'))
      }
    }
  }

  // 이메일 인증 코드 확인
  const handleVerifyAuthCode = async () => {
    if (!authCode.trim()) {
      alert(t('Auth_Code_Required'))
      return
    }

    try {
      const fullEmail = formData.email + PUSAN_DOMAIN
      await api.verifyEmail(fullEmail, authCode)
      alert(t('Email_Verified'))
      setEmailAuthCodeVerifyCompletedState(true)
    } catch (error) {
      alert(t('Email_Verification_Failed'))
    }
  }

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!formData.username.trim()) {
      alert(t('Nickname_Required'))
      return
    }

    if (formData.username.length < 3 || formData.username.length > 8) {
      alert(t('Nickname_Length_Error'))
      return
    }

    try {
      await api.checkNicknameValid(formData.username)
      alert(t('Nickname_Available'))
    } catch (error) {
      if (error.status === 400) {
        alert(t('Nickname_Already_Exists'))
      } else {
        alert(t('Nickname_Check_Failed'))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!emailAuthCodeVerifyCompletedState) {
      alert(t('Email_Verification_Required'))
      return false
    }

    if (!formData.username.trim()) {
      newErrors.username = t('Nickname_Required')
    } else if (
      formData.username.length < 3 ||
      formData.username.length > 8
    ) {
      newErrors.username = t('Nickname_Length_Error')
    }

    if (!formData.student_id.trim()) {
      newErrors.student_id = t('Student_Id_Required')
    }

    if (!formData.real_name.trim()) {
      newErrors.real_name = t('Real_Name_Required')
    }

    if (!formData.collegeId) {
      newErrors.collegeId = t('College_Required')
    }

    if (!formData.departmentId) {
      newErrors.departmentId = t('Department_Required')
    }

    if (!formData.password) {
      newErrors.password = t('Password_Required')
    } else if (formData.password.length < 8 || formData.password.length > 20) {
      newErrors.password = t('Password_Length_Error_Register')
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/.test(formData.password)) {
      newErrors.password = t('Password_Complexity_Error')
    }

    if (formData.password !== formData.passwordAgain) {
      newErrors.passwordAgain = t('Password_Does_Not_Match')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const userData = {
        email: formData.email + PUSAN_DOMAIN,
        username: formData.username,
        real_name: formData.real_name,
        student_id: formData.student_id,
        collegeId: formData.collegeId,
        departmentId: formData.departmentId,
        password: formData.password,
      }

      const result = await register(userData)
      if (result.success) {
        alert(t('Thanks_For_Registering'))
        setShowRegisterModal(false)
        setShowLoginModal(true)
      } else {
        alert(result.error || t('Register_Failed'))
      }
    } catch (error) {
      console.error('Register error:', error)
      alert(t('Register_Failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowRegisterModal(false)
  }

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  if (!showRegisterModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('Register')}
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
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 부산대학교 웹메일 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-900 dark:text-white">
                {t('PNU_Webmail')}
              </label>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  {t('No_Webmail')}{' '}
                  <a
                    href="https://zm911.mailplug.com/member/join"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {t('Sign_Up')}
                  </a>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('Email_Address')}
                  disabled={emailAuthCodeInputState}
                  className="w-full px-4 py-3 pr-32 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white disabled:opacity-50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-semibold">
                  {PUSAN_DOMAIN}
                </span>
              </div>
              <button
                type="button"
                onClick={handleEmailAuth}
                disabled={emailAuthCodeInputState}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('Verify')}
              </button>
            </div>
          </div>

          {/* 이메일 인증 코드 */}
          {emailAuthCodeInputState && (
            <div className="flex gap-2 animate-fadeIn">
              <input
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder={t('Email_Auth_Code')}
                disabled={emailAuthCodeVerifyCompletedState}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleVerifyAuthCode}
                disabled={emailAuthCodeVerifyCompletedState}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('Complete')}
              </button>
            </div>
          )}

          {/* 닉네임 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-900 dark:text-white">
                {t('Nickname')}
              </label>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('Nickname_Length_Hint')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('RegisterNickname')}
                maxLength={8}
                className={`flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                  errors.username
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white`}
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold whitespace-nowrap"
              >
                {t('Check_Duplicate')}
              </button>
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* 학번 */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              {t('Student_Id')}
            </label>
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              placeholder={t('RegisterStudentId')}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                errors.student_id
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white`}
            />
            {errors.student_id && (
              <p className="mt-1 text-sm text-red-500">{errors.student_id}</p>
            )}
          </div>

          {/* 이름(실명) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              {t('Real_Name')}
            </label>
            <input
              type="text"
              name="real_name"
              value={formData.real_name}
              onChange={handleChange}
              placeholder={t('RegisterRealName')}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                errors.real_name
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white`}
            />
            {errors.real_name && (
              <p className="mt-1 text-sm text-red-500">{errors.real_name}</p>
            )}
          </div>

          {/* 단과대학 선택 */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              {t('Select_College')}
            </label>
            <select
              value={formData.collegeId}
              onChange={handleCollegeChange}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                errors.collegeId
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white`}
            >
              <option value="">{t('Select_College')}</option>
              {collegeList.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.college_name}
                </option>
              ))}
            </select>
            {errors.collegeId && (
              <p className="mt-1 text-sm text-red-500">{errors.collegeId}</p>
            )}
          </div>

          {/* 학과 선택 */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              {t('Select_Department')}
            </label>
            <select
              value={formData.departmentId}
              onChange={handleDepartmentChange}
              disabled={!formData.collegeId}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                errors.departmentId
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white disabled:opacity-50`}
            >
              <option value="">{t('Select_Department')}</option>
              {departmentList.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-500">{errors.departmentId}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-900 dark:text-white">
                {t('Password')}
              </label>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('Password_Hint_Register')}</span>
              </div>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('RegisterPassword')}
                className={`w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border ${
                  errors.password
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              {t('Password_Confirm')}
            </label>
            <input
              type="password"
              name="passwordAgain"
              value={formData.passwordAgain}
              onChange={handleChange}
              placeholder={t('Password_Again')}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                errors.passwordAgain
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white`}
            />
            {errors.passwordAgain && (
              <p className="mt-1 text-sm text-red-500">{errors.passwordAgain}</p>
            )}
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('Loading') : t('Register')}
          </button>

          {/* 로그인으로 전환 */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleSwitchToLogin}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary underline transition"
            >
              {t('Already_Have_Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal
