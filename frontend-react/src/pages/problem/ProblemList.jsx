import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 문제 목록 페이지
 */
function ProblemList() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // 상태
  const [problems, setProblems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState([])

  // Query 파라미터
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    difficulty: searchParams.get('difficulty') || '',
    tag: searchParams.get('tag') || '',
    field: searchParams.get('field') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 20,
  })

  // 문제 목록 로드
  useEffect(() => {
    loadProblems()
  }, [searchParams])

  // 태그 목록 로드
  useEffect(() => {
    loadTags()
  }, [])

  /**
   * 문제 목록을 서버에서 불러옵니다.
   * 현재 필터 조건(검색어, 난이도, 태그)과 페이지 정보를 사용합니다.
   */
  const loadProblems = async () => {
    try {
      setLoading(true)
      const offset = (filters.page - 1) * filters.limit

      const response = await api.getProblemList(offset, filters.limit, {
        keyword: filters.keyword,
        difficulty: filters.difficulty,
        tag: filters.tag,
        field: filters.field,
      })

      setProblems(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load problems:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 문제 태그 목록을 서버에서 불러옵니다.
   */
  const loadTags = async () => {
    try {
      const response = await api.getProblemTags()
      setTags(response.data || [])
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  /**
   * 필터 조건을 업데이트하고 URL 쿼리 파라미터를 동기화합니다.
   * 필터 변경 시 페이지는 1로 초기화됩니다.
   * @param {string} key - 필터 키 (keyword, difficulty, tag 등)
   * @param {any} value - 필터 값
   */
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)

    // URL 업데이트
    const params = {}
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k]) params[k] = newFilters[k]
    })
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
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k]) params[k] = newFilters[k]
    })
    setSearchParams(params)
  }

  /**
   * 랜덤 문제를 하나 선택하여 해당 문제 상세 페이지로 이동합니다.
   */
  const handlePickOne = async () => {
    try {
      const response = await api.getRandomProblem()
      if (response.data) {
        navigate(`/problem/${response.data._id}`)
      }
    } catch (error) {
      console.error('Failed to pick random problem:', error)
    }
  }

  /**
   * 난이도에 따른 배지 색상 클래스를 반환합니다.
   * 다크모드를 지원합니다.
   * @param {string} difficulty - 난이도 (Low, Mid, High)
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Low':
        return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950'
      case 'Mid':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950'
      case 'High':
        return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  /**
   * 문제 풀이 상태에 따른 배지를 반환합니다.
   * @param {number} status - 풀이 상태 (2: 해결, 1: 시도)
   * @returns {JSX.Element|null} 상태 배지 JSX 또는 null
   */
  const getStatusBadge = (status) => {
    if (status === 2)
      return <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
    if (status === 1)
      return <span className="text-yellow-600 dark:text-yellow-400 font-bold">○</span>
    return null
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
        <h1 className="text-3xl font-bold text-foreground">{t('Problem_List')}</h1>
        <button
          onClick={handlePickOne}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
        >
          {t('Pick_One')}
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-card rounded-lg shadow border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 검색 */}
          <input
            type="text"
            placeholder={t('Search_Problem')}
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword', e.target.value)}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {/* 난이도 */}
          <select
            value={filters.difficulty}
            onChange={(e) => updateFilter('difficulty', e.target.value)}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('All')} {t('Difficulty')}</option>
            <option value="Low">{t('Low')}</option>
            <option value="Mid">{t('Mid')}</option>
            <option value="High">{t('High')}</option>
          </select>

          {/* 카테고리/분야 */}
          <select
            value={filters.field}
            onChange={(e) => updateFilter('field', e.target.value)}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('All')} {t('Category')}</option>
            <option value="0">구현</option>
            <option value="2">자료구조</option>
            <option value="1">수학</option>
            <option value="3">탐색</option>
            <option value="4">정렬</option>
            <option value="5">알고리즘</option>
          </select>

          {/* 태그 */}
          <select
            value={filters.tag}
            onChange={(e) => updateFilter('tag', e.target.value)}
            className="px-4 py-2 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('All')} {t('Tags')}</option>
            {tags.map((tag) => (
              <option key={tag.id || tag.name} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 문제 목록 테이블 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Th_Problem_Submission_State')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Th_Problem_Id')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Th_Problem_Title')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Th_Problem_Difficulty')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('Th_Problem_AC_Rate')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {problems.length > 0 ? (
              problems.map((problem) => (
                <tr
                  key={problem.id}
                  className="hover:bg-accent transition cursor-pointer"
                  onClick={() => navigate(`/problem/${problem._id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(problem.my_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {problem._id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {problem.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(problem.difficulty)}`}
                    >
                      {problem.difficulty === 'Low'
                        ? t('Low')
                        : problem.difficulty === 'Mid'
                          ? t('Mid')
                          : t('High')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {problem.submission_number > 0
                      ? (
                          (problem.accepted_number / problem.submission_number) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  {t('noProblemList')}
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

export default ProblemList
