import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

/**
 * 사용자 인증 및 프로필 관리 스토어
 */
const useUserStore = create(
  persist(
    (set, get) => ({
      // 상태
      user: null, // 현재 로그인한 사용자 정보
      profile: null, // 사용자 프로필 정보 (확장 정보)
      isAuthenticated: false,
      loading: false,
      error: null,

      // 액션

      // 로그인
      login: async (username, password) => {
        set({ loading: true, error: null })
        try {
          // 로그인 요청 (세션 생성)
          await api.login(username, password)

          // 로그인 성공 후 사용자 정보 조회
          const profileResponse = await api.getUserProfile()
          const profileData = profileResponse.data

          // user 정보 추출 (백엔드는 profile.user에 사용자 기본 정보 포함)
          const userData = profileData.user || {}

          set({
            user: userData,
            profile: profileData,
            isAuthenticated: true,
            loading: false,
          })

          return { success: true, data: userData }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // 로그아웃
      logout: async () => {
        set({ loading: true })
        try {
          await api.logout()
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          })
          return { success: true }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // 회원가입
      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.register(userData)
          set({ loading: false })
          return { success: true, data: response.data }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // 사용자 프로필 조회
      fetchUserProfile: async (username) => {
        set({ loading: true, error: null })
        try {
          const response = await api.getUserProfile(username)
          set({ profile: response.data, loading: false })
          return { success: true, data: response.data }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // 프로필 업데이트
      updateProfile: async (data) => {
        set({ loading: true, error: null })
        try {
          const response = await api.updateProfile(data)
          // 현재 사용자 정보 및 프로필 업데이트
          if (get().user) {
            set({
              user: { ...get().user, ...response.data },
              profile: { ...get().profile, ...response.data }
            })
          }
          set({ loading: false })
          return { success: true, data: response.data }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // 비밀번호 변경
      changePassword: async (oldPassword, newPassword) => {
        set({ loading: true, error: null })
        try {
          const response = await api.changePassword(oldPassword, newPassword)
          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // 이메일 변경
      changeEmail: async (email, code) => {
        set({ loading: true, error: null })
        try {
          const response = await api.changeEmail(email, code)
          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // 상태 초기화
      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-storage', // localStorage 키
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useUserStore
