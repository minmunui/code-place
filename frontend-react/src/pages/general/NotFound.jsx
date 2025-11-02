import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * 404 페이지
 * 잘못된 경로로 접근했을 때 표시됩니다.
 */
function NotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const goHome = () => {
    navigate('/')
  }

  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="bg-card rounded-lg shadow-lg border border-border p-12 max-w-2xl w-full">
        {/* 404 타이틀 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center text-[180px] font-bold leading-none">
            <span className="text-primary">4</span>
            <span className="text-green-500 animate-spin-slow inline-block mx-4">
              <svg
                className="w-40 h-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <span className="text-primary">4</span>
          </div>
        </div>

        {/* 메시지 */}
        <p className="text-center text-3xl font-medium text-muted-foreground tracking-[12px] mb-12">
          YOU LOOK LOST
        </p>

        {/* 버튼 */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={goHome}
            className="px-8 py-3 bg-card border-2 border-border text-foreground rounded-lg hover:bg-accent hover:border-primary transition text-lg font-medium w-48"
          >
            {t('Go_Home')}
          </button>
          <button
            onClick={goBack}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-lg font-medium w-48"
          >
            {t('Back')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
