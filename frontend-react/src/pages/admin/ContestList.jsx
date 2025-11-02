import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import adminApi from '../../api/admin'

/**
 * Admin Contest List 페이지
 * 대회 목록 조회, 검색, 수정, 삭제
 */
function ContestList() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')

  // 페이지네이션
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadContests()
  }, [page])

  /**
   * 대회 목록 로드
   */
  const loadContests = async () => {
    try {
      setLoading(true)
      const offset = (page - 1) * limit
      const response = await adminApi.getContestList({
        offset,
        limit,
        keyword,
      })
      setContests(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load contests:', error)
      alert(t('Failed_To_Load'))
    } finally {
      setLoading(false)
    }
  }

  /**
   * 검색
   */
  const handleSearch = () => {
    setPage(1)
    loadContests()
  }

  /**
   * 대회 수정 페이지로 이동
   */
  const handleEdit = (contestId) => {
    navigate(`/admin/contest/edit/${contestId}`)
  }

  /**
   * 대회 생성 페이지로 이동
   */
  const handleCreate = () => {
    navigate('/admin/contest/create')
  }

  /**
   * 대회 삭제
   */
  const handleDelete = async (contestId) => {
    if (!confirm(t('Confirm_Delete_Contest'))) {
      return
    }

    try {
      await adminApi.deleteContest(contestId)
      alert(t('Contest_Deleted_Successfully'))
      loadContests()
    } catch (error) {
      console.error('Failed to delete contest:', error)
      alert(t('Failed_To_Delete'))
    }
  }

  /**
   * 대회 공개/비공개 토글
   */
  const handleToggleVisible = async (contest) => {
    try {
      await adminApi.updateContest({
        id: contest.id,
        visible: !contest.visible,
      })
      setContests((prev) =>
        prev.map((c) =>
          c.id === contest.id ? { ...c, visible: !c.visible } : c
        )
      )
    } catch (error) {
      console.error('Failed to update contest:', error)
      alert(t('Failed_To_Update'))
    }
  }

  /**
   * 페이지 변경
   */
  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  /**
   * 대회 상태 표시
   */
  const getContestStatus = (contest) => {
    const now = new Date()
    const startTime = new Date(contest.start_time)
    const endTime = new Date(contest.end_time)

    if (now < startTime) {
      return { text: t('Not_Started'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
    } else if (now >= startTime && now <= endTime) {
      return { text: t('Underway'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
    } else {
      return { text: t('Ended'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('Contest_List')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            대회를 관리하고 편집할 수 있습니다
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
          {t('Create_Contest')}
        </button>
      </div>

      {/* 검색 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('Search_Keyword')}
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            {t('Search')}
          </button>
        </div>
      </div>

      {/* 대회 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">{t('Loading')}</div>
          </div>
        ) : contests.length > 0 ? (
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
                    {t('Status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Start_Time')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('End_Time')}
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
                {contests.map((contest) => {
                  const status = getContestStatus(contest)
                  return (
                    <tr
                      key={contest.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                        #{contest.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contest.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(contest.start_time).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(contest.end_time).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleVisible(contest)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            contest.visible
                              ? 'bg-primary'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              contest.visible ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(contest.id)}
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
                            onClick={() => handleDelete(contest.id)}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            {t('No_Contests_Found')}
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
    </div>
  )
}

export default ContestList
