import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { findRestaurantById } from '@/data/restaurants'
import { findBookingByRef } from '@/data/bookings'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PartySizeStepper from '@/components/ui/PartySizeStepper'
import { useDisclosure } from '@/hooks/useDisclosure'
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE, ROUTES, TIME_SLOT_OPTIONS } from '@/lib/constants'
import { selectItems } from '@/lib/utils'
import { formatDate, unsplashUrl } from '@/lib/format'
import type { BookingStatus, ConfirmedBooking } from '@/types/booking'

export default function ManageBooking() {
  const { t } = useTranslation()
  const { ref } = useParams<{ ref: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  // A booking just created in Checkout is handed over via router state so it
  // renders immediately; a bookmarked/shared link falls back to the mock
  // dataset lookup by ref (this is where a real API fetch will plug in later).
  const freshBooking = location.state as ConfirmedBooking | null
  const storedBooking = findBookingByRef(ref)
  const restaurantId = freshBooking?.restaurantId ?? storedBooking?.restaurantId
  const restaurant = findRestaurantById(restaurantId)

  const date = freshBooking?.date ?? storedBooking?.date ?? ''
  const time = freshBooking?.time ?? storedBooking?.time ?? ''
  const partySize = freshBooking?.partySize ?? String(storedBooking?.partySize ?? '')

  const [status, setStatus] = useState<BookingStatus>(storedBooking?.status ?? 'confirmed')
  const cancelConfirm = useDisclosure()
  const modifyPanel = useDisclosure()
  const [newDate, setNewDate] = useState(date)
  const [newTime, setNewTime] = useState(time)
  const [newParty, setNewParty] = useState(Number(partySize) || 1)
  const [cancelled, setCancelled] = useState(false)
  const [modified, setModified] = useState(false)

  if (!ref || !restaurant) {
    return <Navigate to={ROUTES.bookings} replace />
  }

  const formattedDate = formatDate(date)
  const timeOptions = restaurant.availableTimes.length > 0 ? restaurant.availableTimes : [...TIME_SLOT_OPTIONS]

  const handleCancel = () => {
    setCancelled(true)
    setStatus('cancelled')
    cancelConfirm.close()
  }

  const handleModify = () => {
    setModified(true)
    modifyPanel.close()
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-terra-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-terra" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-2">{t('manageBooking.cancelledTitle')}</h2>
          <p className="text-sm text-ink-muted mb-6">
            {t('manageBooking.cancelledDetail', { restaurant: restaurant.name })}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(ROUTES.restaurants)}>{t('manageBooking.findAnotherRestaurant')}</Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.home)}>{t('manageBooking.goHome')}</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={() => navigate(ROUTES.bookings)} className="text-sm text-ink-muted hover:text-ink flex items-center gap-1 mb-6">
          {t('manageBooking.myBookings')}
        </button>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-2">{t('manageBooking.title')}</h1>
        <p className="text-sm text-ink-muted mb-8">{t('manageBooking.reference')} <span className="font-mono font-medium text-ink">{ref}</span></p>

        {modified && (
          <div className="bg-sage-light rounded-xl p-3 mb-5 flex items-center gap-2">
            <span className="text-sage">✓</span>
            <p className="text-sm text-sage font-medium">{t('manageBooking.bookingUpdated')}</p>
          </div>
        )}

        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-sm font-medium ${
          status === 'confirmed' ? 'bg-sage-light text-sage' :
          status === 'pending' ? 'bg-gold-light text-gold' :
          'bg-terra-light text-terra'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status === 'confirmed' ? t('manageBooking.allSet') : status === 'pending' ? t('manageBooking.awaitingConfirmation') : t('manageBooking.cancelled')}
        </div>

        {/* Restaurant info */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-5">
          <div className="flex gap-4 p-5 border-b border-border">
            <img
              src={unsplashUrl(restaurant.imageId, { width: 200, height: 160 })}
              alt={restaurant.name}
              className="w-20 h-16 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-ink">{restaurant.name}</h3>
              <p className="text-xs text-ink-faint mt-0.5">{restaurant.address}</p>
              <a href="#" className="text-xs text-terra font-medium mt-1 hover:underline inline-block">{t('manageBooking.getDirections')}</a>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border text-center p-4">
            <div>
              <p className="text-xs text-ink-faint mb-1">{t('confirmation.date')}</p>
              <p className="text-sm font-semibold text-ink">{modified ? newDate : formattedDate.split(',')[0]}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint mb-1">{t('confirmation.time')}</p>
              <p className="text-sm font-semibold text-ink">{modified ? newTime : time}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint mb-1">{t('confirmation.guests')}</p>
              <p className="text-sm font-semibold text-ink">{modified ? newParty : partySize}</p>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-5">
          <h3 className="font-medium text-sm text-ink mb-3">{t('manageBooking.yourBookingDetails')}</h3>
          <div className="space-y-2 text-sm text-ink-muted">
            <div className="flex justify-between">
              <span>{t('manageBooking.occasion')}</span>
              <span className="text-ink font-medium">Anniversary</span>
            </div>
            <div className="flex justify-between">
              <span>{t('manageBooking.dietary')}</span>
              <span className="text-ink font-medium">Vegetarian</span>
            </div>
            <div className="flex justify-between">
              <span>{t('manageBooking.seating')}</span>
              <span className="text-ink font-medium">Outdoor</span>
            </div>
            <div className="flex justify-between">
              <span>{t('manageBooking.specialRequests')}</span>
              <span className="text-ink font-medium text-right max-w-48">Window table if possible</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-ink-muted">{t('manageBooking.contactRestaurant')} <a href={`tel:${restaurant.phone}`} className="text-terra font-medium hover:underline">{restaurant.phone}</a></p>
          </div>
        </div>

        {/* Modify panel */}
        {modifyPanel.isOpen && (
          <div className="bg-white rounded-2xl border border-terra/30 p-5 mb-5">
            <h3 className="font-medium text-sm text-ink mb-4">{t('manageBooking.modifyReservation')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">{t('manageBooking.newDate')}</label>
                <DatePicker value={newDate} onChange={setNewDate} className="w-full bg-cream" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">{t('manageBooking.newTime')}</label>
                <Select items={selectItems(timeOptions)} value={newTime} onValueChange={(v) => v && setNewTime(v)}>
                  <SelectTrigger className="w-full bg-cream">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1">{t('manageBooking.partySize')}</label>
                <PartySizeStepper
                  value={newParty}
                  onIncrement={() => setNewParty((size) => Math.min(MAX_PARTY_SIZE, size + 1))}
                  onDecrement={() => setNewParty((size) => Math.max(MIN_PARTY_SIZE, size - 1))}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleModify} className="flex-1">{t('manageBooking.confirmChanges')}</Button>
              <Button variant="outline" onClick={modifyPanel.close} className="flex-1">{t('manageBooking.cancel')}</Button>
            </div>
          </div>
        )}

        {/* Cancel confirmation */}
        {cancelConfirm.isOpen && (
          <div className="bg-terra-subtle rounded-2xl border border-terra/30 p-5 mb-5">
            <h3 className="font-medium text-ink mb-2">{t('manageBooking.cancelConfirmTitle')}</h3>
            <p className="text-sm text-ink-muted mb-4">
              {t('manageBooking.cancelConfirmDetail')}
            </p>
            <div className="flex gap-3">
              <Button onClick={handleCancel} className="flex-1 font-semibold">{t('manageBooking.yesCancelMyBooking')}</Button>
              <Button variant="outline" onClick={cancelConfirm.close} className="flex-1 bg-white">{t('manageBooking.keepMyBooking')}</Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {status !== 'cancelled' && !cancelConfirm.isOpen && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => { modifyPanel.toggle(); cancelConfirm.close() }}
              className="flex-1"
              size="lg"
            >
              {t('manageBooking.modifyReservationButton')}
            </Button>
            <Button
              variant="outline"
              onClick={() => { cancelConfirm.open(); modifyPanel.close() }}
              className="flex-1 !text-terra hover:!border-terra"
              size="lg"
            >
              {t('manageBooking.cancelReservationButton')}
            </Button>
          </div>
        )}

        <p className="text-xs text-ink-faint mt-4 text-center">
          {t('manageBooking.cancellationPolicyText')}{' '}
          <a href="#" className="text-terra hover:underline">{t('manageBooking.cancellationPolicy')}</a>
        </p>
      </div>
    </div>
  )
}
