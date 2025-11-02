import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAdminStore from '../../../store/adminStore'
import adminApi from '../../../api/admin'
import AdminSidebar from './AdminSidebar'

/**
 * Admin Layout 컴포넌트
 * 사이드바, 헤더, 컨텐츠 영역을 포함
 */
function AdminLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { adminUser, adminLogout, updateAdminProfile } = useAdminStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  /**
   * 로그인 상태 확인
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await adminApi.getProfile()
        if (response.data) {
          updateAdminProfile(response.data)
        } else {
          // 프로필이 없으면 로그인 페이지로
          navigate('/admin/login')
        }
      } catch (error) {
        console.error('Failed to get admin profile:', error)
        navigate('/admin/login')
      }
    }

    checkAuth()
  }, [navigate, updateAdminProfile])

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = async () => {
    try {
      await adminApi.logout()
      adminLogout()
      navigate('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // 에러가 나도 로그아웃 처리
      adminLogout()
      navigate('/admin/login')
    }
  }

  /**
   * 사이드바 토글
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 사이드바 */}
      <AdminSidebar isOpen={sidebarOpen} />

      {/* 메인 컨텐츠 영역 */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* 헤더 */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            {/* 사이드바 토글 버튼 */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* 우측 메뉴 */}
            <div className="flex items-center gap-4">
              {/* 전체화면 버튼 */}
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen()
                  } else {
                    document.exitFullscreen()
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={t('Fullscreen')}
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>

              {/* 사용자 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                    {adminUser?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {adminUser?.username || 'Admin'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {dropdownOpen && (
                  <>
                    {/* 배경 오버레이 */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />

                    {/* 메뉴 */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 rounded-lg"
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {t('Logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 컨텐츠 영역 */}
        <main className="p-6">
          <Outlet />
        </main>

        {/* 푸터 */}
        <footer className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 Code Place Admin Panel. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default AdminLayout
