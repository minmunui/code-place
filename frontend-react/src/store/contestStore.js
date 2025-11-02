import { create } from 'zustand'
import api from '../api'

/**
 * 대회 정보 관리 스토어
 */
const useContestStore = create((set, get) => ({
  // 상태
  currentContest: null, // 현재 보고 있는 대회 정보
  hasAccess: false, // 대회 접근 권한
  loading: false,
  error: null,

  // 액션

  // 대회 정보 조회
  fetchContest: async (contestId) => {
    set({ loading: true, error: null })
    try {
      const response = await api.getContest(contestId)
      set({
        currentContest: response.data,
        loading: false,
      })
      return { success: true, data: response.data }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // 대회 접근 권한 확인
  checkAccess: async (contestId) => {
    set({ loading: true, error: null })
    try {
      const response = await api.checkContestAccess(contestId)
      set({
        hasAccess: response.data.access === true,
        loading: false,
      })
      return { success: true, hasAccess: response.data.access === true }
    } catch (error) {
      set({ loading: false, error: error.message, hasAccess: false })
      return { success: false, error: error.message, hasAccess: false }
    }
  },

  // 대회 비밀번호 확인
  verifyPassword: async (contestId, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.verifyContestPassword(contestId, password)
      set({
        hasAccess: true,
        loading: false,
      })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // 현재 대회 정보 초기화
  clearContest: () => {
    set({
      currentContest: null,
      hasAccess: false,
      error: null,
    })
  },

  // 에러 초기화
  clearError: () => set({ error: null }),
}))

export default useContestStore
