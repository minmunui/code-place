import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * 사용자 업적 페이지
 */
function UserAchievements() {
  const { t } = useTranslation()
  const { username } = useParams()

  return (
    <div>
      <p className="text-gray-600">{username || t('MyHome')} {t('Achievement')}</p>
    </div>
  )
}

export default UserAchievements
