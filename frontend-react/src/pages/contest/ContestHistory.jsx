import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 대회 히스토리 페이지
 * 종료된 대회 목록을 표시합니다.
 */
function ContestHistory() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [contests, setContests] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
    keyword: '',
    rule_type: '',
    year: '',
    month: '',
  })

  useEffect(() => {
    loadContests()
  }, [filters.page])

  /**
   * 종료된 대회 목록을 서버에서 불러옵니다.
   */
  const loadContests = async () => {
    try {
      setLoading(true)
      const offset = (filters.page - 1) * filters.limit
      const response = await api.getContestHistory(offset, filters.limit)
      setContests(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load contest history:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 페이지를 변경하고 URL 쿼리 파라미터를 동기화합니다.
   */
  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
    const params = {}
    if (page > 1) params.page = page
    setSearchParams(params)
  }

  /**
   * 대회 상세 페이지로 이동합니다.
   */
  const handleContestClick = (contestId) => {
    navigate(`/contest/${contestId}`)
  }

  /**
   * 날짜를 포맷팅합니다.
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('Loading')}</div>
      </div>
    )
  }

  const totalPages = Math.ceil(total / filters.limit)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('Contest_History')}</h1>
          <p className="text-muted-foreground mt-2">{t('Ended_Contest_Not_Exist')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadContests}
            className="px-4 py-2 bg-card border border-border text-foreground rounded hover:bg-accent transition"
          >
            {t('Refresh')}
          </button>
          <button
            onClick={() => navigate('/contest')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          >
            {t('Underway_Contest')}
          </button>
        </div>
      </div>

      {/* 대회 목록 */}
      <div className="space-y-2">
        {contests.length > 0 ? (
          contests.map((contest) => (
            <div
              key={contest.id}
              onClick={() => handleContestClick(contest.id)}
              className="bg-card rounded-lg shadow border border-border p-6 hover:shadow-lg hover:border-primary/50 transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {contest.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{t('Start_Date')}: {formatDate(contest.start_time)}</span>
                    <span>{t('End_Date')}: {formatDate(contest.end_time)}</span>
                    <span>{t('Contest_Participant')}: {contest.total_participant || 0}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 text-sm font-medium rounded bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-400">
                    {t('Ended')}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                    {t(contest.rule_type)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-lg shadow border border-border p-12 text-center">
            <p className="text-muted-foreground">{t('Ended_Contest_Not_Exist')}</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-card border border-border text-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
          >
            {t('Before_Announcement')}
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded transition ${
                    filters.page === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground hover:bg-accent'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === totalPages}
            className="px-4 py-2 bg-card border border-border text-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
          >
            {t('Next_Announcement')}
          </button>
        </div>
      )}
    </div>
  )
}

export default ContestHistory
