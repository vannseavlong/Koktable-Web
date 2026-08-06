import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useRestaurantById } from '@/data/restaurants'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/constants'
import { formatDate, formatPartySize, unsplashUrl } from '@/lib/format'
import type { ConfirmedBooking } from '@/types/booking'

export default function Confirmation() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const booking = location.state as ConfirmedBooking | null
  const { data: restaurant, isLoading: isRestaurantLoading, isError: isRestaurantError } = useRestaurantById(booking?.restaurantId)
  const { user } = useAuth()

  // A confirmation only makes sense right after checkout hands off state;
  // a bare visit/refresh has nothing authentic to show, so bounce home.
  if (!booking || (!isRestaurantLoading && (isRestaurantError || !restaurant))) {
    return <Navigate to={ROUTES.home} replace />
  }
  if (isRestaurantLoading || !restaurant) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-ink-muted">{t('common.loading')}</p>
      </div>
    )
  }

  const formattedDate = formatDate(booking.date)

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">{t('confirmation.title')}</h1>
          <p className="text-ink-muted">{t('confirmation.subtitle', { restaurant: restaurant.name })}</p>
        </div>

        {/* Booking reference */}
        <div className="bg-ink text-white rounded-2xl p-5 mb-5 text-center">
          <p className="text-xs font-medium text-ink-faint tracking-widest uppercase mb-1">{t('confirmation.bookingReference')}</p>
          <p className="font-mono text-3xl font-medium tracking-wider text-gold">{booking.bookingRef}</p>
          <p className="text-xs text-ink-muted mt-1">{t('confirmation.keepHandy')}</p>
        </div>

        {/* Booking summary card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-5">
          <div className="flex gap-4 p-5 border-b border-border">
            <img
              src={unsplashUrl(restaurant.imageId, { width: 200, height: 160 })}
              alt={restaurant.name}
              className="w-20 h-16 rounded-xl object-cover shrink-0"
            />
            <div>
              <h3 className="font-display font-semibold text-ink text-base">{restaurant.name}</h3>
              <p className="text-xs text-ink-faint mt-0.5">{[restaurant.district, restaurant.city].filter(Boolean).join(', ')}</p>
              <p className="text-xs text-ink-muted mt-1">{restaurant.address}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border text-center p-4">
            <div className="px-3">
              <p className="text-xs text-ink-faint mb-1">{t('confirmation.date')}</p>
              <p className="text-sm font-semibold text-ink leading-tight">{formattedDate.split(',').slice(0, 1)}</p>
              <p className="text-xs text-ink-muted">{formattedDate.split(',').slice(1).join(',').trim()}</p>
            </div>
            <div className="px-3">
              <p className="text-xs text-ink-faint mb-1">{t('confirmation.time')}</p>
              <p className="text-sm font-semibold text-ink">{booking.time}</p>
            </div>
            <div className="px-3">
              <p className="text-xs text-ink-faint mb-1">{t('confirmation.guests')}</p>
              <p className="text-sm font-semibold text-ink">{formatPartySize(booking.partySize)}</p>
            </div>
          </div>
        </div>

        {/* Confirmation sent notice */}
        <div className="bg-gold-light rounded-xl p-4 mb-5 flex gap-3">
          <span className="text-base mt-0.5">📧</span>
          <div>
            <p className="text-sm font-medium text-ink">{t('confirmation.confirmationSent')}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {t('confirmation.confirmationSentDetail', { email: booking.email })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button className="flex flex-col items-center gap-1.5 py-4 bg-white rounded-xl border border-border hover:border-terra/30 hover:shadow-md transition-all">
            <span className="text-xl">📅</span>
            <span className="text-xs font-medium text-ink">{t('confirmation.addToCalendar')}</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 py-4 bg-white rounded-xl border border-border hover:border-terra/30 hover:shadow-md transition-all">
            <span className="text-xl">🗺️</span>
            <span className="text-xs font-medium text-ink">{t('confirmation.getDirections')}</span>
          </button>
          <button
            onClick={() => navigate(ROUTES.manageBooking(booking.bookingRef), { state: booking })}
            className="flex flex-col items-center gap-1.5 py-4 bg-white rounded-xl border border-border hover:border-terra/30 hover:shadow-md transition-all"
          >
            <span className="text-xl">✏️</span>
            <span className="text-xs font-medium text-ink">{t('confirmation.manageBooking')}</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 py-4 bg-white rounded-xl border border-border hover:border-terra/30 hover:shadow-md transition-all">
            <span className="text-xl">📤</span>
            <span className="text-xs font-medium text-ink">{t('confirmation.share')}</span>
          </button>
        </div>

        {/* Booking a table always requires being signed in (Checkout's auth gate), so by the
            time this page renders an account already exists — point to My Bookings instead
            of the old guest-checkout "create an account" prompt. */}
        <div className="bg-cream rounded-xl border border-border p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">{t('confirmation.signedInAs', { email: user?.email ?? booking.email })}</p>
            <p className="text-xs text-ink-muted">{t('confirmation.trackAllBookings')}</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.bookings)}
            className="px-4 py-2 bg-terra text-white rounded-lg text-xs font-medium shrink-0 hover:bg-terra-dark transition-all"
          >
            {t('confirmation.viewMyBookings')}
          </button>
        </div>

        <div className="text-center mt-6">
          <Link to={ROUTES.home} className="text-sm text-terra font-medium hover:underline">
            {t('confirmation.findAnotherRestaurant')}
          </Link>
        </div>
      </div>
    </div>
  )
}
