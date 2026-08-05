import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROUTES } from '@/lib/constants'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `hover:text-ink transition-colors ${isActive ? 'text-terra' : ''}`

export default function Nav() {
  const { t } = useTranslation()
  const { isOpen: menuOpen, toggle: toggleMenu, close: closeMenu } = useDisclosure()

  const navLinks = [
    { to: ROUTES.home, label: t('nav.home') },
    { to: ROUTES.restaurants, label: t('nav.restaurants') },
    { to: ROUTES.bookings, label: t('nav.myBookings') },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to={ROUTES.home} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-terra flex items-center justify-center">
            <span className="text-white text-sm font-display font-semibold">T</span>
          </div>
          <span className="font-display font-semibold text-lg text-ink tracking-tight">
            Kok<span className="text-terra">Table</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-ink-muted">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === ROUTES.home} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <LanguageSwitcher />
          <Link
            to={ROUTES.login}
            className="px-4 py-2 rounded-full border border-terra text-terra hover:bg-terra hover:text-white transition-all text-sm font-medium"
          >
            {t('nav.signIn')}
          </Link>
        </div>

        <div className="sm:hidden flex items-center gap-1">
          <LanguageSwitcher />
          <button
            className="flex flex-col gap-1 p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-ink transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-ink transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-ink transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden bg-cream border-t border-border px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === ROUTES.home}
              onClick={closeMenu}
              className="text-left text-sm font-medium text-ink-muted hover:text-ink"
            >
              {link.label}
            </NavLink>
          ))}
          <Link to={ROUTES.login} onClick={closeMenu} className="text-left text-sm font-medium text-terra">
            {t('nav.signIn')}
          </Link>
        </div>
      )}
    </nav>
  )
}
