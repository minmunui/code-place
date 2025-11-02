import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 유저 랭킹 페이지
 * - 상위 3명을 특별히 표시
 * - 나머지 유저들을 테이블로 표시
 */
function UserRank() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [topUsers, setTopUsers] = useState([])
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const limit = 10

  useEffect(() => {
    loadRankData()
  }, [page])

  /**
   * 랭킹 데이터를 서버에서 불러옵니다.
   * 상위 3명과 페이지별 유저 목록을 각각 조회합니다.
   */
  const loadRankData = async () => {
    try {
      setLoading(true)

      // 상위 3명 로드
      const topResponse = await api.getUserRank(0, 3)
      setTopUsers(topResponse.data.results || [])

      // 나머지 유저들 로드 (offset은 3부터 시작)
      const offset = (page - 1) * limit + 3
      const response = await api.getUserRank(offset, limit)
      setUsers(response.data.results || [])
      setTotal(response.data.total - 3) // 상위 3명 제외
    } catch (error) {
      console.error('Failed to load rank data:', error)
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

  if (loading && topUsers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">{t('Loading')}</div>
      </div>
    )
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-8">
      {/* 상위 3명 표시 */}
      <div className="flex items-end justify-center gap-8">
        {/* 2위 */}
        {topUsers[1] && (
          <div className="flex flex-col items-center mt-12">
            <h2 className="text-lg font-bold text-muted-foreground mb-2">2위</h2>
            <div
              onClick={() => navigate(`/user-home/dashboard/${topUsers[1].username}`)}
              className="bg-card rounded-lg shadow-lg border border-border p-6 cursor-pointer hover:bg-accent transition flex flex-col items-center"
            >
              <div className="relative mb-3">
                <img
                  src={topUsers[1].avatar}
                  alt={topUsers[1].username}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  2
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">{topUsers[1].username}</p>
                <p className="text-sm text-muted-foreground">{topUsers[1].major}</p>
                <p className="text-sm font-semibold text-foreground mt-2">
                  {formatNumber(topUsers[1].score)}{t('Point')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 1위 */}
        {topUsers[0] && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-primary mb-2">1위</h2>
            <div
              onClick={() => navigate(`/user-home/dashboard/${topUsers[0].username}`)}
              className="bg-card rounded-lg shadow-2xl border-2 border-primary p-8 cursor-pointer hover:bg-accent transition flex flex-col items-center"
            >
              <div className="relative mb-4">
                <img
                  src={topUsers[0].avatar}
                  alt={topUsers[0].username}
                  className="w-32 h-32 rounded-full object-cover"
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-foreground">{topUsers[0].username}</p>
                <p className="text-sm text-muted-foreground">{topUsers[0].major}</p>
                <p className="text-base font-bold text-primary mt-2">
                  {formatNumber(topUsers[0].score)}{t('Point')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3위 */}
        {topUsers[2] && (
          <div className="flex flex-col items-center mt-12">
            <h2 className="text-lg font-bold text-muted-foreground mb-2">3위</h2>
            <div
              onClick={() => navigate(`/user-home/dashboard/${topUsers[2].username}`)}
              className="bg-card rounded-lg shadow-lg border border-border p-6 cursor-pointer hover:bg-accent transition flex flex-col items-center"
            >
              <div className="relative mb-3">
                <img
                  src={topUsers[2].avatar}
                  alt={topUsers[2].username}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  3
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">{topUsers[2].username}</p>
                <p className="text-sm text-muted-foreground">{topUsers[2].major}</p>
                <p className="text-sm font-semibold text-foreground mt-2">
                  {formatNumber(topUsers[2].score)}{t('Point')}
                </p>
              </div>
            </div>
          </div>
        )}
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
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="6" className="px-6 py-4">
                    <div className="h-12 bg-muted animate-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
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
                      <span className="text-xs text-cyan-600">
                        {user.growth > 0 ? `▲ ${formatNumber(user.growth)}` : '-'}
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

export default UserRank
