import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * 사용자 커뮤니티 활동 페이지
 */
function UserCommunity() {
  const { t } = useTranslation()
  const { username } = useParams()

  return (
    <div>
      <p className="text-gray-600">
        {username || t('MyHome')} {t('Community')}
      </p>
    </div>
  )
}

export default UserCommunity
