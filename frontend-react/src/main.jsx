import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n' // i18n 설정 초기화

/**
 * MSW 활성화 (개발 환경에서만)
 * 실제 API 테스트를 위해 임시로 비활성화
 */
async function enableMocking() {
  // MSW 비활성화 - 실제 백엔드와 연동 테스트
  // if (import.meta.env.DEV) {
  //   const { worker } = await import('./mocks/browser')
  //   return worker.start({
  //     onUnhandledRequest: 'bypass', // mock되지 않은 요청은 실제 API로 전달
  //   })
  // }
  return Promise.resolve()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
