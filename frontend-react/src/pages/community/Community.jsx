import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import useUserStore from '../../store/userStore'

/**
 * 커뮤니티 게시글 목록 페이지
 * 게시글 목록을 조회하고 페이지네이션을 제공합니다.
 */
function Community() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useUserStore()

  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // 필터 상태
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
  })

  useEffect(() => {
    loadPosts()
  }, [searchParams])

  /**
   * 게시글 목록을 서버에서 불러옵니다.
   */
  const loadPosts = async () => {
    try {
      setLoading(true)
      const offset = (filters.page - 1) * filters.limit

      const params = {
        offset,
        limit: filters.limit,
      }

      const response = await api.getCommunityPosts(params)
      setPosts(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load community posts:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 페이지를 변경하고 URL 쿼리 파라미터를 동기화합니다.
   * @param {number} page - 이동할 페이지 번호
   */
  const handlePageChange = (page) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)

    const params = {}
    if (page > 1) params.page = page

    setSearchParams(params)
  }

  /**
   * 게시글 상세 페이지로 이동합니다.
   * @param {number} postId - 게시글 ID
   */
  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`)
  }

  /**
   * 날짜 문자열을 한국어 형식으로 포맷팅합니다.
   * @param {string} dateString - ISO 형식의 날짜 문자열
   * @returns {string} 포맷팅된 날짜 문자열
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('Just_Now')
    if (diffMins < 60) return t('Minutes_Ago', { count: diffMins })
    if (diffHours < 24) return t('Hours_Ago', { count: diffHours })
    if (diffDays < 7) return t('Days_Ago', { count: diffDays })

    return date.toLocaleDateString('ko-KR')
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('Community')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('Community_Description')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadPosts}
            className="px-4 py-2 bg-card border border-border text-foreground rounded hover:bg-accent transition"
          >
            {t('Refresh')}
          </button>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/community/write')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
            >
              {t('Write')}
            </button>
          )}
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-2">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className="bg-card rounded-lg shadow border border-border p-6 hover:shadow-lg hover:border-primary/50 transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {post.author?.username || t('Unknown')}
                    </span>
                    <span>·</span>
                    <span>{formatDate(post.created_at)}</span>
                    {post.comment_count > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          {post.comment_count}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {post.post_type === 'ANNOUNCEMENT' && (
                  <span className="px-3 py-1 text-xs font-medium rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
                    {t('Announcement')}
                  </span>
                )}
                {post.post_type === 'QUESTION' && (
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded ${
                      post.question_status === 'CLOSED'
                        ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {post.question_status === 'CLOSED' ? t('Solved') : t('In_Progress')}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-lg shadow border border-border p-12 text-center">
            <p className="text-muted-foreground">{t('No_Posts')}</p>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/community/write')}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
              >
                {t('Write_First_Post')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-card border border-border text-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition"
          >
            {t('Prev')}
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
            {t('Next')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Community
