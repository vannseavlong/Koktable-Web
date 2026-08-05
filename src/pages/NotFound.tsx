import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🍽️</div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">{t('notFound.title')}</h1>
        <p className="text-sm text-ink-muted mb-6">{t('notFound.subtitle')}</p>
        <Link to={ROUTES.home} className="inline-block px-5 py-2.5 bg-terra text-white rounded-lg text-sm font-medium hover:bg-terra-dark transition-all">
          {t('notFound.backToHome')}
        </Link>
      </div>
    </div>
  )
}
