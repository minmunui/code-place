import { create } from 'zustand'

/**
 * UI 상태 관리 스토어
 */
const useUiStore = create((set) => ({
  // 모달 상태
  showLoginModal: false,
  showRegisterModal: false,

  // 로딩 상태
  globalLoading: false,

  // 팝업 정보
  popup: null,

  // 액션

  // 로그인 모달 표시/숨김
  setShowLoginModal: (show) => set({ showLoginModal: show }),

  // 회원가입 모달 표시/숨김
  setShowRegisterModal: (show) => set({ showRegisterModal: show }),

  // 전역 로딩 상태 설정
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  // 팝업 설정
  setPopup: (popup) => set({ popup }),

  // 팝업 닫기
  closePopup: () => set({ popup: null }),
}))

export default useUiStore
