import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * 사용자 문제 풀이 현황 페이지
 */
function UserProblems() {
  const { t } = useTranslation()
  const { username } = useParams()

  return (
    <div>
      <p className="text-gray-600">
        {username || t('MyHome')} {t('Problem_Status')}
      </p>
    </div>
  )
}

export default UserProblems
