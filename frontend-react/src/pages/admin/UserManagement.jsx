import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import adminApi from '../../api/admin'
import { handleApiError } from '../../utils/errorHandler'

/**
 * Admin User Management 페이지
 * 사용자 목록 조회, 검색, 수정, 삭제
 */
function UserManagement() {
  const { t } = useTranslation()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])

  // 필터 및 페이지네이션
  const [filters, setFilters] = useState({
    keyword: '',
    page: 1,
    limit: 20,
  })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadUsers()
  }, [filters.page])

  /**
   * 사용자 목록 로드
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
      const offset = (filters.page - 1) * filters.limit
      const response = await adminApi.getUserList({
        offset,
        limit: filters.limit,
        keyword: filters.keyword,
      })
      setUsers(response.data.results || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      const message = handleApiError('Load Users', error, t('Failed_To_Load'))
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 검색
   */
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }))
    loadUsers()
  }

  /**
   * 사용자 선택 토글
   */
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  /**
   * 전체 선택/해제
   */
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u) => u.id))
    }
  }

  /**
   * 사용자 삭제
   */
  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) {
      alert(t('Please_Select_Users'))
      return
    }

    if (!confirm(t('Confirm_Delete_Users', { count: selectedUsers.length }))) {
      return
    }

    try {
      for (const userId of selectedUsers) {
        await adminApi.deleteUser(userId)
      }
      alert(t('Users_Deleted_Successfully'))
      setSelectedUsers([])
      loadUsers()
    } catch (error) {
      const message = handleApiError('Delete Users', error, t('Failed_To_Delete'))
      alert(message)
    }
  }

  /**
   * 페이지 변경
   */
  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const totalPages = Math.ceil(total / filters.limit)

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('User_Management')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          사용자 목록을 조회하고 관리할 수 있습니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('User_Statistics')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('Total_Users')}
            </p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          {/* 삭제 버튼 */}
          {selectedUsers.length > 0 && (
            <button
              onClick={handleDeleteUsers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
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
              {t('Delete_Selected')} ({selectedUsers.length})
            </button>
          )}

          {/* 검색 */}
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, keyword: e.target.value }))
                }
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
        </div>
      </div>

      {/* 사용자 테이블 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">{t('Loading')}</div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === users.length && users.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Username')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Real_Name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Admin_Type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('Created_At')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {user.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.avatar && (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.real_name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.admin_type === 'Super Admin'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : user.admin_type === 'Admin'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {user.admin_type || 'Regular User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.create_time).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            {t('No_Users_Found')}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                {t('Prev')}
              </button>

              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                {filters.page} / {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
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

export default UserManagement
