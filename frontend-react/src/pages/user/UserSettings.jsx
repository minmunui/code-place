import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import useUserStore from '../../store/userStore'

/**
 * 사용자 설정 페이지
 * 프로필 정보를 수정할 수 있습니다.
 */
function UserSettings() {
  const { t } = useTranslation()
  const { user, profile, updateProfile } = useUserStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [languages, setLanguages] = useState([])
  const [avatarPreview, setAvatarPreview] = useState(null)

  const [formData, setFormData] = useState({
    username: '',
    language: '',
    college: '',
    department: '',
    github: '',
    mood: '',
  })

  const [oldUsername, setOldUsername] = useState('')
  const [usernameChecked, setUsernameChecked] = useState(true)
  const [errors, setErrors] = useState({})

  const MOOD_MAX_LENGTH = 256

  useEffect(() => {
    loadInitialData()
  }, [])

  /**
   * 초기 데이터를 불러옵니다.
   */
  const loadInitialData = async () => {
    try {
      setLoading(true)

      // 병렬로 데이터 로드
      const [profileRes, collegesRes, languagesRes] = await Promise.all([
        api.getUserProfile(),
        api.getCollegeList(),
        api.getLanguages(),
      ])

      // 프로필 데이터 설정
      const profile = profileRes.data
      setFormData({
        username: profile.user?.username || '',
        language: profile.language || '',
        college: profile.college || '',
        department: profile.department || '',
        github: profile.github || '',
        mood: profile.mood || '',
      })
      setOldUsername(profile.user?.username || '')

      // 대학 목록 설정
      setColleges(collegesRes.data || [])

      // 언어 목록 설정
      setLanguages(languagesRes.data || [])

      // 대학이 선택되어 있으면 학과 목록 로드
      if (profile.college) {
        const deptRes = await api.getDepartmentList(profile.college)
        setDepartments(deptRes.data || [])
      }
    } catch (error) {
      console.error('Failed to load user settings:', error)
      alert(t('Unknown_Error'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 폼 입력값을 업데이트합니다.
   */
  const handleChange = async (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // username이 변경되면 중복 확인 초기화
    if (name === 'username') {
      setUsernameChecked(false)
      if (errors.username) {
        setErrors((prev) => ({ ...prev, username: '' }))
      }
    }

    // 대학이 변경되면 학과 목록 다시 로드
    if (name === 'college' && value) {
      try {
        const deptRes = await api.getDepartmentList(value)
        setDepartments(deptRes.data || [])
        setFormData((prev) => ({ ...prev, department: '' }))
      } catch (error) {
        console.error('Failed to load departments:', error)
      }
    }

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * 닉네임 중복 확인을 수행합니다.
   */
  const handleCheckUsername = async () => {
    if (!formData.username) {
      setErrors((prev) => ({ ...prev, username: t('Nickname_Required') }))
      return
    }

    // 기존 닉네임과 동일하면 확인 불필요
    if (formData.username === oldUsername) {
      alert(t('Success'))
      setUsernameChecked(true)
      return
    }

    try {
      await api.checkNicknameValid(formData.username)
      alert(t('Success'))
      setUsernameChecked(true)
      setErrors((prev) => ({ ...prev, username: '' }))
    } catch (error) {
      if (error.response?.status === 400) {
        setErrors((prev) => ({ ...prev, username: t('Nickname_Duplicated') }))
      } else {
        setErrors((prev) => ({ ...prev, username: t('Unknown_Error') }))
      }
      setUsernameChecked(false)
    }
  }

  /**
   * 아바타 파일 선택 처리
   */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 검사 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert(t('Image_Max_Size_Alert'))
      return
    }

    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      alert(t('Unknown_Error'))
      return
    }

    // 미리보기 설정
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // 업로드
    try {
      setUploadingAvatar(true)
      const response = await api.uploadAvatar(file)

      if (response.data) {
        // 프로필 업데이트
        const result = await updateProfile({ avatar: response.data })
        if (result.success) {
          alert(t('Profile_Update_Success'))
        }
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      alert(t('Unknown_Error'))
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  /**
   * 폼을 제출합니다.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 유효성 검사
    if (!formData.username) {
      setErrors((prev) => ({ ...prev, username: t('Nickname_Required') }))
      return
    }

    if (!usernameChecked) {
      alert(t('CheckDuplicate'))
      return
    }

    if (formData.mood && formData.mood.length > MOOD_MAX_LENGTH) {
      setErrors((prev) => ({
        ...prev,
        mood: t('Mood_Description'),
      }))
      return
    }

    try {
      setSaving(true)
      const result = await updateProfile(formData)

      if (result.success) {
        alert(t('Profile_Update_Success'))
        setOldUsername(formData.username)
        setUsernameChecked(true)
      } else {
        alert(t('Unknown_Error'))
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert(t('Unknown_Error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('Loading')}</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{t('User_Setting')}</h1>

      {/* 아바타 변경 */}
      <div className="bg-card rounded-lg shadow border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">{t('Profile_Avatar')}</h2>
        <div className="flex items-center gap-6">
          {/* 현재 아바타 */}
          <div className="flex-shrink-0">
            <img
              src={avatarPreview || profile?.avatar || '/default-avatar.svg'}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* 업로드 버튼 */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              {t('Image_Max_Size_Notice')}
            </p>
            <label
              htmlFor="avatar-upload"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition cursor-pointer"
            >
              {uploadingAvatar ? t('Loading') : t('Change_Avatar')}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 닉네임 */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">{t('Profile_Setting')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('Nickname')} *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-2 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.username ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder={t('Nickname')}
                />
                <button
                  type="button"
                  onClick={handleCheckUsername}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition whitespace-nowrap"
                >
                  {t('CheckDuplicate')}
                </button>
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* 선호 언어 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('FavoriteLanguage')}
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('Language')}</option>
                {languages.map((lang) => (
                  <option key={lang.name} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 대학 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('School')}
              </label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('School')}</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 학과 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('Major')}
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!formData.college}
                className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {formData.college ? t('Major') : t('College_Required')}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('Blog')}
              </label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('Github_Description')}
              />
            </div>

            {/* 상태 메시지 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('Mood')}
              </label>
              <textarea
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                rows={3}
                maxLength={MOOD_MAX_LENGTH}
                className={`w-full px-4 py-2 bg-background text-foreground border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                  errors.mood ? 'border-red-500' : 'border-input'
                }`}
                placeholder={t('Mood_Description')}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.mood && (
                    <p className="text-red-500 text-sm">{errors.mood}</p>
                  )}
                </div>
                <p
                  className={`text-sm ${
                    formData.mood.length > MOOD_MAX_LENGTH
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {formData.mood.length} / {MOOD_MAX_LENGTH}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={loadInitialData}
            className="px-6 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-accent transition"
          >
            {t('Reset')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('Loading') : t('Save')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserSettings
