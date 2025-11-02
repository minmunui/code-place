import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import adminApi from '../../api/admin'

/**
 * Admin Announcement Management 페이지
 * 공지사항 목록 조회, 생성, 수정, 삭제
 */
function AnnouncementManagement() {
  const { t } = useTranslation()

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)

  // 페이지네이션
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)

  // 모달 상태
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState('create') // 'create' or 'edit'
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null)

  // 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    visible: true,
  })

  useEffect(() => {
    loadAnnouncements()
  }, [page])

  /**
   * 공지사항 목록 로드
   */
  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const response = await adminApi.getAnnouncementList(offset, limit)
      setAnnouncements(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load announcements:', error)
      alert(t('Failed_To_Load'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 공지사항 생성 모달 열기
   */
  const handleCreate = () => {
    setMode('create')
    setFormData({
      title: '',
      content: '',
      visible: true,
    })
    setShowModal(true)
  }

  /**
   * 공지사항 수정 모달 열기
   */
  const handleEdit = async (announcementId) => {
    try {
      setMode('edit')
      setCurrentAnnouncementId(announcementId)
      const response = await adminApi.getAnnouncement(announcementId)
      const announcement = response.data
      setFormData({
        title: announcement.title,
        content: announcement.content,
        visible: announcement.visible,
      })
      setShowModal(true)
    } catch (error) {
      console.error('Failed to load announcement:', error)
      alert(t('Failed_To_Load'))
    }
  }

  /**
   * 공지사항 저장 (생성/수정)
   */
  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert(t('Title_Required'))
      return
    }
    if (!formData.content.trim()) {
      alert(t('Content_Required'))
      return
    }

    try {
      if (mode === 'create') {
        await adminApi.createAnnouncement(formData)
        alert(t('Announcement_Created_Successfully'))
      } else {
        await adminApi.updateAnnouncement({
          id: currentAnnouncementId,
          ...formData,
        })
        alert(t('Announcement_Updated_Successfully'))
      }
      setShowModal(false)
      loadAnnouncements()
    } catch (error) {
      console.error('Failed to save announcement:', error)
      alert(t('Failed_To_Save'))
    }
  }

  /**
   * 공지사항 삭제
   */
  const handleDelete = async (announcementId) => {
    if (!confirm(t('Confirm_Delete_Announcement'))) {
      return
    }

    try {
      await adminApi.deleteAnnouncement(announcementId)
      alert(t('Announcement_Deleted_Successfully'))
      loadAnnouncements()
    } catch (error) {
      console.error('Failed to delete announcement:', error)
      alert(t('Failed_To_Delete'))
    }
  }

  /**
   * 공지사항 공개/비공개 토글
   */
  const handleToggleVisible = async (announcement) => {
    try {
      await adminApi.updateAnnouncement({
        id: announcement.id,
        visible: !announcement.visible,
      })
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcement.id ? { ...a, visible: !a.visible } : a
        )
      )
    } catch (error) {
      console.error('Failed to update announcement:', error)
      alert(t('Failed_To_Update'))
    }
  }

  /**
   * 페이지 변경
   */
  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('Announcement_Management')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            공지사항을 관리하고 편집할 수 있습니다
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t('Create_Announcement')}
        </button>
      </div>

      {/* 공지사항 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">{t('Loading')}</div>
          </div>
        ) : announcements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Title')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Author')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Created_At')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Visible')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {announcements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                      #{announcement.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {announcement.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {announcement.created_by?.username || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(announcement.create_time).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleVisible(announcement)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          announcement.visible
                            ? 'bg-primary'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            announcement.visible ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(announcement.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title={t('Edit')}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title={t('Delete')}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            {t('No_Announcements_Found')}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                {t('Prev')}
              </button>

              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                {t('Next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 공지사항 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mode === 'create' ? t('Create_Announcement') : t('Edit_Announcement')}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('Title')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder={t('Title')}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('Content')} *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder={t('Content')}
                  rows={10}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* 공개 여부 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('Visible')}
                </label>
                <button
                  onClick={() =>
                    setFormData({ ...formData, visible: !formData.visible })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    formData.visible
                      ? 'bg-primary'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      formData.visible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  {t('Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnnouncementManagement
