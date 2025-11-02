import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 급상승 랭킹 페이지
 * - 급상승한 유저들을 테이블로 표시
 */
function SurgeRank() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const limit = 30

  useEffect(() => {
    loadSurgeRank()
  }, [page])

  /**
   * 급상승 랭킹 데이터를 서버에서 불러옵니다.
   */
  const loadSurgeRank = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const response = await api.getSurgeRank(offset, limit)
      setUsers(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load surge rank:', error)
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
   * 티어 코드를 한국어 이름으로 변환합니다.
   * @param {string} tier - 티어 코드 (bronze, silver, gold 등)
   * @returns {string} 한국어 티어 이름
   */
  const getTierName = (tier) => {
    const tierNames = {
      bronze: '브론즈',
      silver: '실버',
      gold: '골드',
      platinum: '플래티넘',
      diamond: '다이아몬드',
    }
    return tierNames[tier] || tier
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('Today_Surge_User')}</h1>
        <p className="text-muted-foreground mt-2">{t('Today_Surge_User')}</p>
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
                {t('Major')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                {t('Tier_Home_Ranking')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                {t('Score')}/{t('Today_Growth')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                {t('Solved_Problems')}
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
              users.map((user) => (
                <tr
                  key={user.username}
                  className="hover:bg-accent transition cursor-pointer"
                  onClick={() => navigate(`/user-home/dashboard/${user.username}`)}
                >
                  <td className="px-6 py-4 text-center text-sm text-foreground">
                    {user.rank}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {user.major}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span className="font-semibold text-foreground">
                      {getTierName(user.tier)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-foreground">
                        {formatNumber(user.score)}{t('Point')}
                      </span>
                      <span className="text-xs text-emerald-600 font-semibold">
                        ▲ {formatNumber(user.growth)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-foreground">
                    {user.solved}
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

export default SurgeRank
