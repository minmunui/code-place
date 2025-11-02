import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import { useAuthStore } from '../../store/authStore'

/**
 * 로그아웃 페이지
 * 자동으로 로그아웃 처리하고 홈으로 이동합니다.
 */
function Logout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    const performLogout = async () => {
      try {
        await api.logout()
        clearAuth()
        navigate('/', { replace: true })
      } catch (error) {
        console.error('Logout failed:', error)
        // 에러가 발생해도 로컬 상태는 클리어하고 홈으로 이동
        clearAuth()
        navigate('/', { replace: true })
      }
    }

    performLogout()
  }, [navigate, clearAuth])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-muted-foreground">{t('Loading')}</div>
    </div>
  )
}

export default Logout
