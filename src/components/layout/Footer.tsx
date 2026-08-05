import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BRAND_NAME, ROUTES } from '@/lib/constants'

interface FooterProps {
  /** Reserves space below `lg` so a page's fixed bottom bar doesn't cover the footer. */
  mobileStickyBarOffset?: boolean
}

export default function Footer({ mobileStickyBarOffset }: FooterProps) {
  const { t } = useTranslation()

  return (
    <footer className={`bg-ink text-ink-faint mt-auto ${mobileStickyBarOffset ? 'pb-20 lg:pb-0' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-terra flex items-center justify-center">
                <span className="text-white text-xs font-display font-semibold">T</span>
              </div>
              <span className="font-display font-semibold text-base text-white">
                Kok<span className="text-terra">Table</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t('footer.discover')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTES.restaurants} className="hover:text-white transition-colors">{t('footer.allRestaurants')}</Link></li>
              <li><Link to={ROUTES.restaurants} className="hover:text-white transition-colors">{t('footer.khmerCuisine')}</Link></li>
              <li><Link to={ROUTES.restaurants} className="hover:text-white transition-colors">{t('footer.fineDining')}</Link></li>
              <li><Link to={ROUTES.restaurants} className="hover:text-white transition-colors">{t('footer.bkk1Area')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t('footer.account')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTES.login} className="hover:text-white transition-colors">{t('footer.signIn')}</Link></li>
              <li><Link to={ROUTES.login} className="hover:text-white transition-colors">{t('footer.createAccount')}</Link></li>
              <li><Link to={ROUTES.bookings} className="hover:text-white transition-colors">{t('footer.myBookings')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t('footer.company')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.aboutUs')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.listYourRestaurant')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.termsOfService')}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-muted/30 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs">{t('footer.copyright', { brand: BRAND_NAME })}</p>
          <p className="text-xs">{t('footer.builtWithCare')}</p>
        </div>
      </div>
    </footer>
  )
}
