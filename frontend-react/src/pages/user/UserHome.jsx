import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * 사용자 홈 페이지 (레이아웃)
 */
function UserHome() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('MyHome')}</h1>
      <Outlet />
    </div>
  )
}

export default UserHome
