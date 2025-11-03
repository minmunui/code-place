import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import adminApi from '../../api/admin'
import { handleApiError } from '../../utils/errorHandler'

/**
 * Admin 대회 생성 페이지
 */
function CreateContest() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // 대회 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    password: '',
    rule_type: 'ACM',
    real_time_rank: true,
    visible: true,
    allow_paste: true,
    allowed_ip_ranges: [{ value: '' }],
  })

  /**
   * 입력 필드 변경 핸들러
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * IP 범위 추가
   */
  const addIPRange = () => {
    setFormData((prev) => ({
      ...prev,
      allowed_ip_ranges: [...prev.allowed_ip_ranges, { value: '' }],
    }))
  }

  /**
   * IP 범위 제거
   */
  const removeIPRange = (index) => {
    setFormData((prev) => ({
      ...prev,
      allowed_ip_ranges: prev.allowed_ip_ranges.filter((_, i) => i !== index),
    }))
  }

  /**
   * IP 범위 값 변경
   */
  const handleIPRangeChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      allowed_ip_ranges: prev.allowed_ip_ranges.map((item, i) =>
        i === index ? { value } : item
      ),
    }))
  }

  /**
   * 폼 유효성 검사
   */
  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = t('Title_Required')
    }

    if (!formData.description.trim()) {
      newErrors.description = t('Description_Required')
    }

    if (!formData.start_time) {
      newErrors.start_time = t('Start_Time_Required')
    }

    if (!formData.end_time) {
      newErrors.end_time = t('End_Time_Required')
    }

    if (formData.start_time && formData.end_time) {
      if (new Date(formData.start_time) >= new Date(formData.end_time)) {
        newErrors.end_time = t('End_Time_Must_After_Start_Time')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 대회 생성 제출
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // IP 범위 변환 (빈 값 제거)
      const allowed_ip_ranges = formData.allowed_ip_ranges
        .map((item) => item.value)
        .filter((value) => value.trim() !== '')

      // API 요청 데이터 준비
      const requestData = {
        ...formData,
        allowed_ip_ranges,
        password: formData.password || '', // 빈 문자열을 NULL로 변환 (백엔드에서 처리)
      }

      await adminApi.createContest(requestData)

      // 성공 시 대회 목록으로 이동
      navigate('/admin/contest', { state: { refresh: true } })
    } catch (error) {
      const message = handleApiError('Create Contest', error, t('Create_Failed'))
      setErrors({ submit: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('Create_Contest')}</h1>
        <p className="text-muted-foreground mt-2">{t('Create_Contest_Description')}</p>
      </div>

      {/* 에러 메시지 */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 대회 제목 */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            {t('Contest_Title')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.title ? 'border-red-500' : 'border-border'
            }`}
            placeholder={t('Contest_Title_Placeholder')}
            maxLength={128}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* 대회 설명 */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            {t('Contest_Description')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className={`w-full px-4 py-2 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.description ? 'border-red-500' : 'border-border'
            }`}
            placeholder={t('Contest_Description_Placeholder')}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* 시간 설정 */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">{t('Time_Configuration')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 시작 시간 */}
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-foreground mb-2">
                {t('Start_Time')} <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.start_time ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
            </div>

            {/* 종료 시간 */}
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-foreground mb-2">
                {t('End_Time')} <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.end_time ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
            </div>
          </div>
        </div>

        {/* 접근 제어 */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">{t('Access_Control')}</h3>

          {/* 비밀번호 */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              {t('Contest_Password')} <span className="text-muted-foreground">({t('Optional')})</span>
            </label>
            <input
              type="text"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('Contest_Password_Placeholder')}
              maxLength={32}
            />
            <p className="text-xs text-muted-foreground mt-1">{t('Contest_Password_Help')}</p>
          </div>

          {/* 허용된 IP 범위 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('Allowed_IP_Ranges')} <span className="text-muted-foreground">({t('Optional')})</span>
            </label>
            <div className="space-y-2">
              {formData.allowed_ip_ranges.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleIPRangeChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="192.168.1.0/24"
                  />
                  {formData.allowed_ip_ranges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIPRange(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      {t('Remove')}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIPRange}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              + {t('Add_IP_Range')}
            </button>
            <p className="text-xs text-muted-foreground mt-1">{t('IP_Range_Help')}</p>
          </div>
        </div>

        {/* 대회 규칙 */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">{t('Contest_Rules')}</h3>

          {/* 규칙 타입 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('Rule_Type')} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="rule_type"
                  value="ACM"
                  checked={formData.rule_type === 'ACM'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-foreground">ACM</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="rule_type"
                  value="OI"
                  checked={formData.rule_type === 'OI'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-foreground">OI</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('Rule_Type_Help')}</p>
          </div>
        </div>

        {/* 기능 설정 */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">{t('Feature_Settings')}</h3>

          <div className="space-y-4">
            {/* 실시간 순위 */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="real_time_rank" className="text-sm font-medium text-foreground">
                  {t('Real_Time_Rank')}
                </label>
                <p className="text-xs text-muted-foreground">{t('Real_Time_Rank_Help')}</p>
              </div>
              <input
                type="checkbox"
                id="real_time_rank"
                name="real_time_rank"
                checked={formData.real_time_rank}
                onChange={handleChange}
                className="w-5 h-5"
              />
            </div>

            {/* 가시성 */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="visible" className="text-sm font-medium text-foreground">
                  {t('Contest_Visible')}
                </label>
                <p className="text-xs text-muted-foreground">{t('Contest_Visible_Help')}</p>
              </div>
              <input
                type="checkbox"
                id="visible"
                name="visible"
                checked={formData.visible}
                onChange={handleChange}
                className="w-5 h-5"
              />
            </div>

            {/* 붙여넣기 허용 */}
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="allow_paste" className="text-sm font-medium text-foreground">
                  {t('Allow_Paste')}
                </label>
                <p className="text-xs text-muted-foreground">{t('Allow_Paste_Help')}</p>
              </div>
              <input
                type="checkbox"
                id="allow_paste"
                name="allow_paste"
                checked={formData.allow_paste}
                onChange={handleChange}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/contest')}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {t('Cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('Creating') : t('Create_Contest')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateContest
