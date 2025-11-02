import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
 * 대회 규칙 유형
 */
const RULE_TYPE = {
  'ACM': 'ACM',
  'OI': 'OI',
}

/**
 * 대회 목록 페이지
 * 대회 목록을 조회하고 필터링할 수 있습니다.
 */
function ContestList() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useUserStore()

  const [contests, setContests] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // 필터 상태
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    rule_type: searchParams.get('rule_type') || '',
    keyword: searchParams.get('keyword') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
  })

  useEffect(() => {
    loadContests()
  }, [searchParams])

  /**
   * 대회 목록을 서버에서 불러옵니다.
   */
  const loadContests = async () => {
    try {
      setLoading(true)
      const offset = (filters.page - 1) * filters.limit

      const params = {
        offset,
        limit: filters.limit,
      }

      if (filters.status) params.status = filters.status
      if (filters.rule_type) params.rule_type = filters.rule_type
      if (filters.keyword) params.keyword = filters.keyword

      const response = await api.getContests(params)
      setContests(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load contests:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 필터 조건을 업데이트하고 URL 쿼리 파라미터를 동기화합니다.
   * @param {string} key - 필터 키
   * @param {any} value - 필터 값
   */
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)

    const params = {}
    if (newFilters.status) params.status = newFilters.status
    if (newFilters.rule_type) params.rule_type = newFilters.rule_type
    if (newFilters.keyword) params.keyword = newFilters.keyword
    if (newFilters.page > 1) params.page = newFilters.page

    setSearchParams(params)
  }

  /**
   * 페이지를 변경하고 URL 쿼리 파라미터를 동기화합니다.
   * @param {number} page - 이동할 페이지 번호
   */
  const handlePageChange = (page) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)

    const params = {}
    if (newFilters.status) params.status = newFilters.status
    if (newFilters.rule_type) params.rule_type = newFilters.rule_type
    if (newFilters.keyword) params.keyword = newFilters.keyword
    if (page > 1) params.page = page

    setSearchParams(params)
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
        <h1 className="text-3xl font-bold text-foreground">{t('Contests')}</h1>
        <button
          onClick={loadContests}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
        >
          {t('Refresh')}
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-card rounded-lg shadow border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 상태 필터 */}
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('State')}</option>
            {Object.entries(getContestStatus(t)).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>

          {/* 규칙 유형 필터 */}
          <select
            value={filters.rule_type}
            onChange={(e) => updateFilter('rule_type', e.target.value)}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('Rule')}</option>
            {Object.entries(RULE_TYPE).map(([key, value]) => (
              <option key={key} value={key}>
                {t(value)}
              </option>
            ))}
          </select>

          {/* 검색 */}
          <input
            type="text"
            placeholder={t('Contest_Search_Keyword')}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateFilter('keyword', filters.keyword)
              }
            }}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {/* 검색 버튼 */}
          <button
            onClick={() => updateFilter('keyword', filters.keyword)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          >
            {t('Search')}
          </button>
        </div>
      </div>

      {/* 대회 목록 */}
      <div className="space-y-4">
        {contests.length > 0 ? (
          contests.map((contest) => (
            <div
              key={contest.id}
              onClick={() => navigate(`/contest/${contest.id}`)}
              className="bg-card rounded-lg shadow border border-border p-6 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {contest.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(contest.status)}`}
                    >
                      {getContestStatus(t)[contest.status]?.name || 'Unknown'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                      {contest.rule_type}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{t('Start_Date')}: {formatDate(contest.start_time)}</p>
                    <p>{t('End_Date')}: {formatDate(contest.end_time)}</p>
                    <p className="text-foreground">
                      {t('Contest_Participant')}: {contest.total_participant || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-lg shadow border border-border p-12 text-center">
            <p className="text-muted-foreground">{t('No_contest')}</p>
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

export default ContestList
