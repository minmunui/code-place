import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 대회 랭킹 페이지
 * 대회 참가자들의 순위를 표시합니다.
 */
function ContestRank() {
  const { t } = useTranslation()
  const { contestID } = useParams()

  const [ranks, setRanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  useEffect(() => {
    loadRanks()
  }, [contestID, page])

  /**
   * 대회 랭킹을 서버에서 불러옵니다.
   */
  const loadRanks = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const response = await api.getContestRank(contestID, offset, limit, false)
      setRanks(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load contest ranks:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 페이지를 변경합니다.
   */
  const handlePageChange = (newPage) => {
    setPage(newPage)
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
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t('Contest_Rank')}</h2>
        <button
          onClick={loadRanks}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
        >
          {t('Refresh')}
        </button>
      </div>

      {/* 랭킹 테이블 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        {ranks.length > 0 ? (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground w-20">
                  {t('Ranking')}
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  {t('Username')}
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground w-24">
                  {t('Total_Score')}
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground w-32">
                  {t('AC_Time')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ranks.map((rank, index) => (
                <tr key={rank.user?.id || index} className="hover:bg-accent transition">
                  <td className="px-6 py-4 text-sm text-foreground font-bold">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {rank.user?.username || t('Unknown_Error')}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-foreground font-medium">
                    {rank.accepted_number || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-muted-foreground">
                    {rank.total_time ? `${Math.floor(rank.total_time / 60)}분` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            {t('No_Ranking_Data')}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-card border border-border text-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
          >
            {t('Before_Announcement')}
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
            {t('Next_Announcement')}
          </button>
        </div>
      )}
    </div>
  )
}

export default ContestRank
