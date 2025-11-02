import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 공지사항 목록 페이지
 */
function Notice() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [announcements, setAnnouncements] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const limit = 10

  useEffect(() => {
    loadAnnouncements()
  }, [page])

  /**
   * 공지사항 목록을 서버에서 불러옵니다.
   */
  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const response = await api.getAnnouncements(offset, limit)

      setAnnouncements(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load announcements:', error)
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
   * 날짜 문자열을 한국어 형식으로 포맷팅합니다.
   * @param {string} dateString - ISO 형식의 날짜 문자열
   * @returns {string} 포맷팅된 날짜 문자열
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

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <h1 className="text-3xl font-bold text-foreground">{t('Notice')}</h1>

      {/* 공지사항 목록 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        {announcements.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {t('No_Announcements')}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('Community_Title')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                  {t('Community_CreatedAt')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                  {t('Community_Author')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {announcements.map((announcement) => (
                <tr
                  key={announcement.id}
                  onClick={() => navigate(`/notice/${announcement.id}`)}
                  className="hover:bg-accent transition cursor-pointer"
                >
                  <td className="px-6 py-4 text-center text-sm text-foreground">
                    {announcement.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {announcement.title}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {formatDate(announcement.create_time)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {announcement.created_by?.username || 'admin'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            {t('Back')}
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

export default Notice
