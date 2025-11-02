import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Admin 상태 관리 Store
 */
const useAdminStore = create(
  persist(
    (set, get) => ({
      // Admin 로그인 상태
      isAdminAuthenticated: false,
      adminUser: null,
      adminToken: null,

      /**
       * Admin 로그인
       */
      adminLogin: (user, token) => {
        set({
          isAdminAuthenticated: true,
          adminUser: user,
          adminToken: token,
        })
        if (token) {
          localStorage.setItem('adminToken', token)
        }
      },

      /**
       * Admin 로그아웃
       */
      adminLogout: () => {
        set({
          isAdminAuthenticated: false,
          adminUser: null,
          adminToken: null,
        })
        localStorage.removeItem('adminToken')
      },

      /**
       * Admin 프로필 업데이트
       */
      updateAdminProfile: (user) => {
        set({ adminUser: user })
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminUser: state.adminUser,
        adminToken: state.adminToken,
      }),
    }
  )
)

export default useAdminStore
