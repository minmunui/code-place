import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import useUserStore from '../../store/userStore'

/**
 * 제출 상태 정보를 반환하는 함수
 * @param {Function} t - i18n translation function
 */
const getJudgeStatus = (t) => ({
  '-2': { name: t('Compile_Error'), short: 'CE', color: 'red' },
  '-1': { name: t('Wrong_Answer'), short: 'WA', color: 'red' },
  '0': { name: t('Accepted'), short: 'AC', color: 'green' },
  '1': { name: t('Time_Limit_Exceeded'), short: 'TLE', color: 'orange' },
  '2': { name: t('Time_Limit_Exceeded'), short: 'TLE', color: 'orange' },
  '3': { name: t('Memory_Limit_Exceeded'), short: 'MLE', color: 'orange' },
  '4': { name: t('Runtime_Error'), short: 'RE', color: 'red' },
  '5': { name: t('System_Error'), short: 'SE', color: 'red' },
  '6': { name: t('Pending'), short: 'PD', color: 'yellow' },
  '7': { name: t('Judging'), short: 'JG', color: 'blue' },
  '8': { name: t('Partial_Accepted'), short: 'PC', color: 'yellow' },
})

/**
 * 제출 목록 페이지
 */
function SubmissionList() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useUserStore()

  const [submissions, setSubmissions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // JUDGE_STATUS를 i18n 함수로 생성
  const JUDGE_STATUS = getJudgeStatus(t)

  // 필터 상태
  const [filters, setFilters] = useState({
    result: searchParams.get('result') || '',
    myself: searchParams.get('myself') === '1',
    username: searchParams.get('username') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
  })

  useEffect(() => {
    loadSubmissions()
  }, [searchParams])

  /**
   * 제출 목록을 서버에서 불러옵니다.
   * 현재 필터 조건(결과 상태, 내 제출만 보기, 사용자 이름)과 페이지 정보를 사용합니다.
   */
  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const offset = (filters.page - 1) * filters.limit

      const params = {
        offset,
        limit: filters.limit,
      }

      if (filters.result) params.result = filters.result
      if (filters.myself && isAuthenticated) params.myself = true
      if (filters.username) params.username = filters.username

      const response = await api.getSubmissions(params)
      setSubmissions(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 필터 조건을 업데이트하고 URL 쿼리 파라미터를 동기화합니다.
   * 필터 변경 시 페이지는 1로 초기화됩니다.
   * @param {string} key - 필터 키 (result, myself, username 등)
   * @param {any} value - 필터 값
   */
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)

    const params = {}
    if (newFilters.result) params.result = newFilters.result
    if (newFilters.myself) params.myself = '1'
    if (newFilters.username) params.username = newFilters.username
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
    if (newFilters.result) params.result = newFilters.result
    if (newFilters.myself) params.myself = '1'
    if (newFilters.username) params.username = newFilters.username
    if (page > 1) params.page = page

    setSearchParams(params)
  }

  /**
   * 제출 결과 상태에 따른 배지 색상 클래스를 반환합니다.
   * 다크모드를 지원합니다.
   * @param {string} result - 제출 결과 상태 코드
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getStatusColor = (result) => {
    const status = JUDGE_STATUS[result]
    if (!status) return 'text-muted-foreground bg-muted'

    switch (status.color) {
      case 'green':
        return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950'
      case 'red':
        return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950'
      case 'orange':
        return 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950'
      case 'yellow':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950'
      case 'blue':
        return 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  /**
   * 실행 시간을 밀리초 단위로 포맷팅합니다.
   * @param {number} ms - 밀리초 단위의 실행 시간
   * @returns {string} 포맷팅된 시간 문자열
   */
  const formatTime = (ms) => {
    if (!ms) return '-'
    return `${ms}ms`
  }

  /**
   * 메모리 사용량을 바이트 단위에서 MB 단위로 변환하여 포맷팅합니다.
   * @param {number} bytes - 바이트 단위의 메모리 사용량
   * @returns {string} 포맷팅된 메모리 문자열
   */
  const formatMemory = (bytes) => {
    if (!bytes) return '-'
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  }

  /**
   * 날짜 문자열을 한국어 형식(날짜+시간)으로 포맷팅합니다.
   * @param {string} dateString - ISO 형식의 날짜 문자열
   * @returns {string} 포맷팅된 날짜 시간 문자열
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
        <h1 className="text-3xl font-bold text-foreground">{t('Submissions')}</h1>
        <button
          onClick={loadSubmissions}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
        >
          {t('Refresh')}
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-card rounded-lg shadow border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 결과 상태 */}
          <select
            value={filters.result}
            onChange={(e) => updateFilter('result', e.target.value)}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('All')}</option>
            {Object.entries(JUDGE_STATUS)
              .filter(([key]) => key !== '9' && key !== '2')
              .map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
          </select>

          {/* 내 제출만 보기 */}
          {isAuthenticated && (
            <button
              onClick={() => updateFilter('myself', !filters.myself)}
              className={`px-4 py-2 rounded border transition ${
                filters.myself
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-input hover:bg-accent'
              }`}
            >
              {filters.myself ? t('Mine') : t('All')}
            </button>
          )}

          {/* 사용자 검색 */}
          <input
            type="text"
            placeholder={t('Author')}
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateFilter('username', filters.username)
              }
            }}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {/* 검색 버튼 */}
          <button
            onClick={() => updateFilter('username', filters.username)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          >
            {t('Search')}
          </button>
        </div>
      </div>

      {/* 제출 목록 테이블 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('When')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('ID')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('NavStatus')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Problem')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Time')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Memory')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Language')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Author')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-accent transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatDate(submission.create_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {submission.show_link !== false ? (
                      <button
                        onClick={() => navigate(`/status/${submission.id}`)}
                        className="text-primary hover:text-primary/80"
                      >
                        {submission.id.substring(0, 12)}
                      </button>
                    ) : (
                      <span className="text-foreground">
                        {submission.id.substring(0, 12)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(submission.result)}`}
                    >
                      {JUDGE_STATUS[submission.result]?.short || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/problem/${submission.problem}`)}
                      className="text-primary hover:text-primary/80"
                    >
                      {submission.problem}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatTime(submission.statistic_info?.time_cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatMemory(submission.statistic_info?.memory_cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {submission.language}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() =>
                        navigate(`/user-home/dashboard/${submission.username}`)
                      }
                      className="text-primary hover:text-primary/80 max-w-[150px] truncate"
                    >
                      {submission.username}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  {t('No_Submissions')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-card border border-border text-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
          >
            이전
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
            다음
          </button>
        </div>
      )}
    </div>
  )
}

export default SubmissionList
