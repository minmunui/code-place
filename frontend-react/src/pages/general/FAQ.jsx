import { useTranslation } from 'react-i18next'

/**
 * FAQ 페이지
 */
function FAQ() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">{t('FAQ')}</h1>
      <p className="text-muted-foreground">{t('Frequently_Asked_Questions')}</p>
    </div>
  )
}

export default FAQ
