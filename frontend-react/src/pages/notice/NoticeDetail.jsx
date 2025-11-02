import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'

/**
 * 공지사항 상세 페이지
 */
function NoticeDetail() {
  const { t } = useTranslation()
  const { noticeID } = useParams()
  const navigate = useNavigate()

  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnnouncement()
  }, [noticeID])

  /**
   * 공지사항 상세 정보를 서버에서 불러옵니다.
   */
  const loadAnnouncement = async () => {
    try {
      setLoading(true)
      const response = await api.getAnnouncement(noticeID)
      setAnnouncement(response.data)
    } catch (error) {
      console.error('Failed to load announcement:', error)
    } finally {
      setLoading(false)
    }
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

  if (!announcement) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('No_Announcements')}</p>
          <button
            onClick={() => navigate('/notice')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          >
            {t('Back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={() => navigate('/notice')}
        className="text-primary hover:text-primary/80 transition flex items-center space-x-2"
      >
        <span>←</span>
        <span>{t('Back')}</span>
      </button>

      {/* 공지사항 상세 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-border bg-muted">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {announcement.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{t('Community_Author')}: {announcement.created_by?.username || 'admin'}</span>
            <span>•</span>
            <span>{t('Community_CreatedAt')}: {formatDate(announcement.create_time)}</span>
            {announcement.last_update_time && announcement.last_update_time !== announcement.create_time && (
              <>
                <span>•</span>
                <span>{formatDate(announcement.last_update_time)}</span>
              </>
            )}
          </div>
        </div>

        {/* 내용 */}
        <div className="px-6 py-8">
          <div
            className="prose prose-sm max-w-none dark:prose-invert text-foreground"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate('/notice')}
          className="px-6 py-3 bg-card border border-border text-foreground rounded hover:bg-accent transition"
        >
          목록으로
        </button>
      </div>
    </div>
  )
}

export default NoticeDetail
