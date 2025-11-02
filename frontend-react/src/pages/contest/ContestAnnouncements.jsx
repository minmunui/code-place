import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 대회 공지사항 페이지
 * 대회의 공지사항 목록과 상세를 표시합니다.
 */
function ContestAnnouncements() {
  const { t } = useTranslation()
  const { contestID } = useParams()

  const [announcements, setAnnouncements] = useState([])
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(true)

  useEffect(() => {
    loadAnnouncements()
  }, [contestID])

  /**
   * 대회 공지사항 목록을 서버에서 불러옵니다.
   */
  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await api.getContestAnnouncements(contestID)
      setAnnouncements(response.data || [])
    } catch (error) {
      console.error('Failed to load contest announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 공지사항 상세를 표시합니다.
   */
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement)
    setShowList(false)
  }

  /**
   * 목록으로 돌아갑니다.
   */
  const handleBack = () => {
    setShowList(true)
    setSelectedAnnouncement(null)
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

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {showList ? t('Contest_Announcements') : selectedAnnouncement?.title}
        </h2>
        {showList ? (
          <button
            onClick={loadAnnouncements}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          >
            {t('Refresh')}
          </button>
        ) : (
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-card border border-border text-foreground rounded hover:bg-accent transition"
          >
            {t('Back')}
          </button>
        )}
      </div>

      {/* 목록 또는 상세 */}
      {showList ? (
        <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
          {announcements.length > 0 ? (
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground w-20">
                    {t('ID')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    {t('Community_Title')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground w-32">
                    {t('Date')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground w-32">
                    {t('Author')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {announcements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    onClick={() => handleAnnouncementClick(announcement)}
                    className="hover:bg-accent transition cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {announcement.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {announcement.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(announcement.create_time)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {announcement.created_by?.username || t('Unknown_Error')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              {t('No_Announcements')}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedAnnouncement?.content }}
          />
        </div>
      )}
    </div>
  )
}

export default ContestAnnouncements
