import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useRestaurantById } from '@/data/restaurants'
import { useBookings } from '@/data/bookings'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/constants'
import { formatDate, formatPartySize, unsplashUrl } from '@/lib/format'
import type { Booking } from '@/types/booking'

function BookingCard({ booking, past }: { booking: Booking; past?: boolean }) {
  const { t } = useTranslation()
  const { data: r, isLoading } = useRestaurantById(booking.restaurantId || undefined)

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-border h-24 animate-pulse" />
  }
  if (!r) return null

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-40 aspect-video sm:aspect-auto overflow-hidden bg-border">
          <img
            src={unsplashUrl(r.imageId, { width: 300, height: 200 })}
            alt={r.name}
            className={`w-full h-full object-cover ${past ? 'grayscale opacity-70' : ''}`}
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-display font-semibold text-ink">{r.name}</h3>
              <p className="text-xs text-ink-faint">{r.neighborhood}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-ink-muted mb-3">
            <span>📅 {formatDate(booking.date, 'short')}</span>
            <span>🕖 {booking.time}</span>
            <span>👥 {formatPartySize(booking.partySize)}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-ink-faint">{booking.ref}</p>
            <div className="flex gap-2">
              {past ? (
                <>
                  <Link to={ROUTES.restaurants} className="text-xs text-terra font-medium hover:underline">
                    {t('myBookings.bookAgain')}
                  </Link>
                  {!booking.hasReview && booking.status !== 'cancelled' && (
                    <>
                      <span className="text-border">|</span>
                      <button className="text-xs text-ink-muted font-medium hover:text-ink">
                        {t('myBookings.leaveAReview')}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to={ROUTES.restaurantDetail(r.id)} className="text-xs text-ink-muted hover:text-ink font-medium">
                    {t('myBookings.viewRestaurant')}
                  </Link>
                  <span className="text-border">|</span>
                  <Link to={ROUTES.manageBooking(booking.ref)} className="text-xs text-terra font-medium hover:underline">
                    {t('myBookings.manage')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {!past && booking.status === 'pending' && (
        <div className="bg-gold-light px-4 py-2 text-xs text-gold font-medium">
          {t('myBookings.awaitingConfirmation', { restaurant: r.name })}
        </div>
      )}
    </div>
  )
}

export default function MyBookings() {
  const { t } = useTranslation()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const { upcoming, past, isLoading, isError } = useBookings()

  if (!isAuthenticated) {
    return <Navigate to={`${ROUTES.login}?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">{t('myBookings.title')}</h1>
            <p className="text-sm text-ink-muted mt-1">{t('myBookings.subtitle')}</p>
          </div>
          <Link to={ROUTES.restaurants} className="px-4 py-2 bg-terra text-white rounded-lg text-sm font-medium hover:bg-terra-dark transition-all">
            {t('myBookings.bookATable')}
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cream-dark rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'upcoming' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
          >
            {t('myBookings.upcoming')} ({upcoming.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'past' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
          >
            {t('myBookings.past')} ({past.length})
          </button>
        </div>

        {isLoading && <p className="text-sm text-ink-muted text-center py-24">{t('common.loading')}</p>}
        {isError && <p className="text-sm text-destructive text-center py-24">{t('myBookings.loadError')}</p>}

        {!isLoading && !isError && tab === 'upcoming' && (
          upcoming.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">{t('myBookings.noUpcomingTitle')}</h3>
              <p className="text-ink-muted text-sm mb-6">{t('myBookings.noUpcomingSubtitle')}</p>
              <Link to={ROUTES.home} className="inline-block px-5 py-2.5 bg-terra text-white rounded-lg text-sm font-medium hover:bg-terra-dark transition-all">
                {t('myBookings.findARestaurant')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((booking) => (
                <BookingCard key={booking.ref} booking={booking} />
              ))}
            </div>
          )
        )}

        {!isLoading && !isError && tab === 'past' && (
          <div className="space-y-4">
            {past.map((booking) => (
              <BookingCard key={booking.ref} booking={booking} past />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
