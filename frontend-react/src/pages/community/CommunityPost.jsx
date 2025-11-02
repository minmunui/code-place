import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api'
import useUserStore from '../../store/userStore'

/**
 * 커뮤니티 게시글 상세 페이지
 * 게시글 내용, 댓글 목록을 표시하고 댓글을 작성할 수 있습니다.
 */
function CommunityPost() {
  const { t } = useTranslation()
  const { postId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useUserStore()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPost()
  }, [postId])

  /**
   * 게시글 상세 정보를 서버에서 불러옵니다.
   */
  const loadPost = async () => {
    try {
      setLoading(true)
      const response = await api.getCommunityPost(postId)
      setPost(response.data)
    } catch (error) {
      console.error('Failed to load community post:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 댓글을 작성합니다.
   */
  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) {
      alert(t('Comment_Required'))
      return
    }

    if (!isAuthenticated) {
      alert(t('Please_Login'))
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      await api.createComment(postId, commentContent)
      setCommentContent('')
      alert(t('Comment_Created'))
      loadPost() // 새로고침
    } catch (error) {
      console.error('Failed to create comment:', error)
      alert(t('Comment_Create_Failed'))
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 날짜 문자열을 한국어 형식으로 포맷팅합니다.
   * @param {string} dateString - ISO 형식의 날짜 문자열
   * @returns {string} 포맷팅된 날짜 문자열
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR')
  }

  /**
   * 상대 시간을 계산합니다.
   * @param {string} dateString - ISO 형식의 날짜 문자열
   * @returns {string} 상대 시간 문자열
   */
  const getRelativeTime = (dateString) => {
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

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">{t('Post_Not_Found')}</div>
          <button
            onClick={() => navigate('/community')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          >
            {t('Back_To_List')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <div>
        <button
          onClick={() => navigate('/community')}
          className="text-primary hover:text-primary/80 flex items-center gap-1"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('To_List')}
        </button>
      </div>

      {/* 게시글 카드 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        {/* 게시글 헤더 */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground flex-1">{post.title}</h1>
            <div className="flex gap-2">
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

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            {post.created_at !== post.updated_at && (
              <>
                <span>·</span>
                <span className="text-xs">({t('Edited')})</span>
              </>
            )}
          </div>
        </div>

        {/* 게시글 본문 */}
        <div className="p-6">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        {/* 댓글 헤더 */}
        <div className="p-4 border-b border-border bg-muted">
          <h2 className="text-lg font-bold text-foreground">
            {t('Comments')} {post.comments?.length || 0}{t('Count_Unit')}
          </h2>
        </div>

        {/* 댓글 작성 */}
        {isAuthenticated && (
          <div className="p-6 border-b border-border">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full p-4 bg-background text-foreground border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={4}
              placeholder={t('Comment_Placeholder')}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleCommentSubmit}
                disabled={submitting || !commentContent.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('Creating') : t('Create_Comment')}
              </button>
            </div>
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="divide-y divide-border">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
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
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground">
                        {comment.author?.username || t('Unknown')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <div
                      className="text-foreground prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              {t('No_Comments_Yet')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommunityPost
