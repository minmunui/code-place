import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * OI 랭킹 페이지
 * OI 방식의 유저 랭킹을 표시합니다.
 */
function OIRank() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const limit = 30

  useEffect(() => {
    loadRankData()
  }, [page])

  /**
   * OI 랭킹 데이터를 서버에서 불러옵니다.
   */
  const loadRankData = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const response = await api.getUserRank(offset, limit, 'OI')
      setUsers(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load OI rank data:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 페이지 변경을 처리합니다.
   * @param {number} newPage - 새로 이동할 페이지 번호
   */
  const handlePageChange = (newPage) => {
    setPage(newPage)
    setSearchParams(newPage > 1 ? { page: newPage } : {})
  }

  /**
   * 숫자를 한국어 형식으로 포맷팅합니다.
   * @param {number} num - 포맷팅할 숫자
   * @returns {string} 포맷팅된 문자열
   */
  const formatNumber = (num) => {
    return num?.toLocaleString('ko-KR') || '0'
  }

  /**
   * 정답률을 계산합니다.
   * @param {number} accepted - 정답 수
   * @param {number} total - 전체 제출 수
   * @returns {string} 정답률 문자열
   */
  const getACRate = (accepted, total) => {
    if (!total) return '0.00%'
    return ((accepted / total) * 100).toFixed(2) + '%'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('Loading')}</div>
      </div>
    )
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{t('OI_Ranklist')}</h1>
        <button
          onClick={loadRankData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
        >
          {t('Refresh')}
        </button>
      </div>

      {/* 랭킹 테이블 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase w-20">
                {t('Ranking')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                {t('Username')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                {t('Score')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                {t('AC')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                {t('Total_Submissions')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                {t('AC_Rate')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                  {t('There_Is_No_Data')}
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.user?.username || index}
                  className="hover:bg-accent transition cursor-pointer"
                  onClick={() => navigate(`/user-home/dashboard/${user.user?.username}`)}
                >
                  <td className="px-6 py-4 text-center text-sm font-bold text-foreground">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {user.user?.avatar && (
                        <img
                          src={user.user.avatar}
                          alt={user.user.username}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {user.user?.username || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-foreground">
                    {formatNumber(user.total_score || 0)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-foreground">
                    {user.accepted_number || 0}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {user.submission_number || 0}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {getACRate(user.accepted_number, user.submission_number)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-card border border-border text-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
          >
            Prev
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded transition ${
                    page === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground hover:bg-accent'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-card border border-border text-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default OIRank
