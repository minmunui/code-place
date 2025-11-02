import { useTranslation } from 'react-i18next'

/**
 * 소개 페이지
 */
function About() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">{t('About')}</h1>
      <p className="text-muted-foreground">{t('CSEPDescription')}</p>
    </div>
  )
}

export default About
