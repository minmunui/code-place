import { useEffect, useState } from 'react'

/**
 * 다크모드 테마 훅
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // localStorage에서 저장된 테마 가져오기
    const saved = localStorage.getItem('theme')
    if (saved) return saved

    // 시스템 설정 확인
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement

    // 이전 테마 클래스 제거
    root.classList.remove('light', 'dark')

    // 새 테마 클래스 추가
    root.classList.add(theme)

    // localStorage에 저장
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, setTheme, toggleTheme }
}
