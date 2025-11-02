import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import Navbar from './Navbar'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

/**
 * 기본 레이아웃 컴포넌트
 * 모든 페이지에 공통으로 적용되는 레이아웃
 */
function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 네비게이션 바 */}
      <Navbar />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-muted-foreground">로딩 중...</div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      {/* 푸터 */}
      <footer className="bg-card border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Code Place. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 모달 */}
      <LoginModal />
      <RegisterModal />
    </div>
  )
}

export default Layout
