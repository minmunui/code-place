import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAdminStore from '../../../store/adminStore'

/**
 * Admin Sidebar 컴포넌트
 */
function AdminSidebar({ isOpen }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { adminUser } = useAdminStore()

  const [expandedMenus, setExpandedMenus] = useState({
    general: true,
    problem: false,
    contest: false,
  })

  /**
   * 메뉴 확장/축소 토글
   */
  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }

  /**
   * 슈퍼 관리자 여부 확인
   */
  const isSuperAdmin = adminUser?.admin_type === 'Super Admin'

  /**
   * 문제 권한 여부 확인
   */
  const hasProblemPermission =
    adminUser?.admin_type === 'Super Admin' ||
    adminUser?.problem_permission === 'All' ||
    adminUser?.problem_permission === 'Own'

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 shadow-2xl`}
    >
      {/* 로고 */}
      <div
        className="p-6 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition"
        onClick={() => navigate('/')}
      >
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-center mt-3 text-lg font-bold">Code Place Admin</h1>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="p-4 overflow-y-auto h-[calc(100%-120px)]">
        {/* Dashboard */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition mb-2 ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="font-medium">{t('Dashboard')}</span>
        </NavLink>

        {/* General Menu (Super Admin만) */}
        {isSuperAdmin && (
          <div className="mb-2">
            <button
              onClick={() => toggleMenu('general')}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="font-medium">{t('General')}</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${
                  expandedMenus.general ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedMenus.general && (
              <div className="ml-4 mt-1 space-y-1">
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition ${
                      isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`
                  }
                >
                  {t('User')}
                </NavLink>
                <NavLink
                  to="/admin/announcements"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition ${
                      isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`
                  }
                >
                  {t('Announcement')}
                </NavLink>
                <NavLink
                  to="/admin/config"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition ${
                      isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`
                  }
                >
                  {t('System_Config')}
                </NavLink>
                <NavLink
                  to="/admin/judge-server"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition ${
                      isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`
                  }
                >
                  {t('Judge_Server')}
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Problem Menu */}
        {hasProblemPermission && (
          <div className="mb-2">
            <button
              onClick={() => toggleMenu('problem')}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium">{t('Problem')}</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${
                  expandedMenus.problem ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedMenus.problem && (
              <div className="ml-4 mt-1 space-y-1">
                <NavLink
                  to="/admin/problems"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition ${
                      isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`
                  }
                >
                  {t('Problem_List')}
                </NavLink>
                <NavLink
                  to="/admin/problem/create"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition ${
                      isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`
                  }
                >
                  {t('Create_Problem')}
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Contest Menu */}
        <div className="mb-2">
          <button
            onClick={() => toggleMenu('contest')}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
              <span className="font-medium">{t('Contest')}</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedMenus.contest ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedMenus.contest && (
            <div className="ml-4 mt-1 space-y-1">
              <NavLink
                to="/admin/contests"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm transition ${
                    isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`
                }
              >
                {t('Contest_List')}
              </NavLink>
              <NavLink
                to="/admin/contest/create"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm transition ${
                    isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`
                }
              >
                {t('Create_Contest')}
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}

export default AdminSidebar
