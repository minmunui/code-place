import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * 사용자 대시보드 페이지
 */
function UserDashboard() {
  const { t } = useTranslation()
  const { username } = useParams()

  return (
    <div>
      <p className="text-gray-600">
        {username || t('MyHome')} {t('OJ_Summary')}
      </p>
    </div>
  )
}

export default UserDashboard
