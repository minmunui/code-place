import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 학과별 랭킹 페이지
 * - 학과별 종합 점수와 인원수 표시
 * - 각 학과의 상위 유저들 표시
 */
function MajorRank() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [majors, setMajors] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const limit = 10

  useEffect(() => {
    loadMajorRank()
  }, [page])

  /**
   * 학과별 랭킹 데이터를 서버에서 불러옵니다.
   */
  const loadMajorRank = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const response = await api.getMajorRank(offset, limit)
      setMajors(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load major rank:', error)
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
   * 순위에 따른 배지 색상을 반환합니다.
   * @param {number} rank - 순위
   * @returns {string} Tailwind CSS 클래스 문자열
   */
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white'
    if (rank === 2) return 'bg-slate-400 text-white'
    if (rank === 3) return 'bg-amber-600 text-white'
    return 'bg-muted text-foreground'
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
        <h1 className="text-3xl font-bold text-foreground">{t('Major_Rank')}</h1>
        <p className="text-muted-foreground mt-2">{t('Major_Rank')}</p>
      </div>

      {/* 랭킹 목록 */}
      <div className="space-y-4">
        {majors.length === 0 ? (
          <div className="bg-card rounded-lg shadow border border-border p-12 text-center text-muted-foreground">
            {t('There_Is_No_Data')}
          </div>
        ) : (
          majors.map((major) => (
            <div
              key={major.rank}
              className="bg-card rounded-lg shadow border border-border p-6 hover:bg-accent transition"
            >
              <div className="flex items-center justify-between">
                {/* 순위 및 학과 정보 */}
                <div className="flex items-center space-x-6 flex-1">
                  <div
                    className={`w-16 h-16 rounded-full ${getRankBadgeColor(major.rank)} flex items-center justify-center text-2xl font-bold shadow-lg`}
                  >
                    {major.rank}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{major.major}</h3>
                    <div className="flex items-center space-x-6 mt-2 text-sm text-muted-foreground">
                      <span>
                        {t('Total_Score')}: <span className="font-bold text-foreground">{formatNumber(major.score)}{t('Point')}</span>
                      </span>
                      <span>
                        {t('Num_People')}: <span className="font-bold text-foreground">{formatNumber(major.population)}{t('People')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 상위 유저들 */}
                <div className="flex items-center space-x-2">
                  {major.people?.slice(0, 5).map((person, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/user-home/dashboard/${person.username}`)
                      }}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className="relative">
                        <img
                          src={person.avatar_url || person.avatar}
                          alt={person.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-border group-hover:border-primary transition"
                        />
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            1
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition">
                        {person.username}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
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

export default MajorRank
