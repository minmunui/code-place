import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import useUserStore from '../../store/userStore'

/**
 * 대회 상태 정보
 */
const getContestStatus = (t) => ({
  '-1': { name: t('Not_Started'), color: 'yellow' },
  '0': { name: t('Underway'), color: 'green' },
  '1': { name: t('Ended'), color: 'gray' },
})

/**
 * 대회 상세 페이지
 * 대회의 기본 정보와 탭 네비게이션을 표시합니다.
 */
function ContestDetail() {
  const { t } = useTranslation()
  const { contestID } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useUserStore()

  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContest()
  }, [contestID])

  /**
   * 대회 상세 정보를 서버에서 불러옵니다.
   */
  const loadContest = async () => {
    try {
      setLoading(true)
      const response = await api.getContest(contestID)
      setContest(response.data)
    } catch (error) {
      console.error('Failed to load contest:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 대회 상태에 따른 배지 색상 클래스를 반환합니다.
   * @param {string} status - 대회 상태 코드
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getStatusColor = (status) => {
    const CONTEST_STATUS = getContestStatus(t)
    const statusInfo = CONTEST_STATUS[status]
    if (!statusInfo) return 'text-muted-foreground bg-muted'

    switch (statusInfo.color) {
      case 'green':
        return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950'
      case 'yellow':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950'
      case 'gray':
        return 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-950'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  /**
   * 날짜 문자열을 한국어 형식으로 포맷팅합니다.
   * @param {string} dateString - ISO 형식의 날짜 문자열
   * @returns {string} 포맷팅된 날짜 문자열
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR')
  }

  /**
   * 대회에 참가합니다.
   */
  const handleJoinContest = async () => {
    if (!isAuthenticated) {
      alert(t('Please_login_first'))
      navigate('/login')
      return
    }

    try {
      await api.joinContest(contestID, { password: '' })
      alert(t('Success'))
      loadContest()
    } catch (error) {
      console.error('Failed to join contest:', error)
      alert(t('Unknown_Error'))
    }
  }

  /**
   * 현재 활성화된 탭을 확인합니다.
   * @param {string} path - 확인할 경로
   * @returns {boolean} 활성화 여부
   */
  const isActiveTab = (path) => {
    return location.pathname === `/contest/${contestID}${path}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('Loading')}</div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('No_contest')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 대회 헤더 */}
      <div className="bg-card rounded-lg shadow border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{contest.title}</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(contest.status)}`}
              >
                {getContestStatus(t)[contest.status]?.name || 'Unknown'}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                {contest.rule_type}
              </span>
            </div>
            <div className="text-muted-foreground space-y-1">
              <p>{t('Start_Date')}: {formatDate(contest.start_time)}</p>
              <p>{t('End_Date')}: {formatDate(contest.end_time)}</p>
              <p>{t('Contest_Participant')}: {contest.total_participant || 0}</p>
            </div>
          </div>

          {isAuthenticated && contest.status === '0' && (
            <button
              onClick={handleJoinContest}
              className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
            >
              {t('Button_Enter')}
            </button>
          )}
        </div>

        {/* 대회 설명 */}
        {contest.description && (
          <div className="mt-4 pt-4 border-t border-border">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: contest.description }}
            />
          </div>
        )}
      </div>

      {/* 탭 네비게이션 및 컨텐츠 */}
      <div className="bg-card rounded-lg shadow border border-border">
        <div className="flex border-b border-border">
          <button
            onClick={() => navigate(`/contest/${contestID}`)}
            className={`px-6 py-3 font-medium transition ${
              location.pathname === `/contest/${contestID}`
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('Contest_Overview')}
          </button>
          <button
            onClick={() => navigate(`/contest/${contestID}/problems`)}
            className={`px-6 py-3 font-medium transition ${
              isActiveTab('/problems')
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('Problems')}
          </button>
          <button
            onClick={() => navigate(`/contest/${contestID}/announcements`)}
            className={`px-6 py-3 font-medium transition ${
              isActiveTab('/announcements')
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('Contest_Announcements')}
          </button>
          <button
            onClick={() => navigate(`/contest/${contestID}/rank`)}
            className={`px-6 py-3 font-medium transition ${
              isActiveTab('/rank')
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('Contest_Rank')}
          </button>
        </div>

        <div className="p-6">
          {/* Overview 탭 */}
          {location.pathname === `/contest/${contestID}` && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">{t('Contest_Overview')}</h2>
                <div className="space-y-3 text-foreground">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{t('Start_Date')}:</span>
                    <span>{formatDate(contest.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{t('End_Date')}:</span>
                    <span>{formatDate(contest.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="font-medium">{t('Contest_Participant')}:</span>
                    <span>{contest.total_participant || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{t('Creator')}:</span>
                    <span>{contest.created_by?.username || t('Unknown_Error')}</span>
                  </div>
                </div>
              </div>

              {contest.description && (
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">{t('Description')}</h2>
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: contest.description }}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/contest/${contestID}/problems`)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
                >
                  {t('Problems')}
                </button>
                {isAuthenticated && contest.status === '0' && (
                  <button
                    onClick={handleJoinContest}
                    className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition"
                  >
                    {t('Button_Enter')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContestDetail
