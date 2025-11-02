import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'

/**
 * i18n 설정
 *
 * 지원 언어:
 * - ko: 한국어 (기본)
 * - en: 영어
 *
 * 사용 방법:
 * ```jsx
 * import { useTranslation } from 'react-i18next'
 *
 * function MyComponent() {
 *   const { t } = useTranslation()
 *   return <h1>{t('Home')}</h1>
 * }
 * ```
 */

i18n
  .use(initReactI18next) // React와 i18next 연결
  .init({
    resources: {
      ko: {
        translation: ko,
      },
      en: {
        translation: en,
      },
    },
    lng: 'ko', // 기본 언어 (한국어)
    fallbackLng: 'ko', // 번역이 없을 경우 폴백 언어
    interpolation: {
      escapeValue: false, // React는 이미 XSS 방어를 하므로 false
    },
    react: {
      useSuspense: true, // Suspense 사용 (lazy loading과 호환)
    },
  })

export default i18n
