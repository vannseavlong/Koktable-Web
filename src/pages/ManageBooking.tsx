import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useRestaurantById } from '@/data/restaurants'
import { useBookingByRef } from '@/data/bookings'
import { useCancelReservation } from '@/hooks/api/useReservations'
import CheckIcon from '@/components/icons/CheckIcon'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PartySizeStepper from '@/components/ui/PartySizeStepper'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE, ROUTES, TIME_SLOT_OPTIONS } from '@/lib/constants'
import { selectItems } from '@/lib/utils'
import { formatDate, unsplashUrl } from '@/lib/format'
import type { ConfirmedBooking } from '@/types/booking'

export default function ManageBooking() {
  const { t } = useTranslation()
  const { ref } = useParams<{ ref: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // A booking just created in Checkout is handed over via router state so it
  // renders immediately without waiting on a refetch; otherwise fetch it by
  // ref (the Backend's reservation_id) — this is the real API seam AGENTS.md
  // calls out (previously a mock-dataset lookup).
  const freshBooking = location.state as ConfirmedBooking | null
  const { data: storedBooking, isLoading: isBookingLoading, isError: isBookingError } = useBookingByRef(freshBooking ? undefined : ref)
  const restaurantId = freshBooking?.restaurantId ?? storedBooking?.restaurantId
  const { data: restaurant, isLoading: isRestaurantLoading, isError: isRestaurantError } = useRestaurantById(restaurantId)

  const date = freshBooking?.date ?? storedBooking?.date ?? ''
  const time = freshBooking?.time ?? storedBooking?.time ?? ''
  const partySize = freshBooking?.partySize ?? String(storedBooking?.partySize ?? '')

  const cancelConfirm = useDisclosure()
  const modifyPanel = useDisclosure()
  const [newDate, setNewDate] = useState(date)
  const [newTime, setNewTime] = useState(time)
  const [newParty, setNewParty] = useState(Number(partySize) || 1)
  const [modified, setModified] = useState(false)
  const [locallyCancelled, setLocallyCancelled] = useState(false)
  const cancelReservation = useCancelReservation()

  // The invalidated `reservation` query will eventually reflect `cancelled`
  // too, but that refetch can lag a render behind — track it locally so the
  // confirmation screen shows immediately after a successful cancel.
  const status = locallyCancelled ? 'cancelled' : freshBooking ? 'confirmed' : (storedBooking?.status ?? 'confirmed')

  if (!isAuthenticated) {
    return <Navigate to={`${ROUTES.login}?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  if (!ref) {
    return <Navigate to={ROUTES.bookings} replace />
  }
  const isLoading = (!freshBooking && isBookingLoading) || (!!restaurantId && isRestaurantLoading)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-ink-muted">{t('common.loading')}</p>
      </div>
    )
  }
  if (!freshBooking && (isBookingError || !storedBooking || isRestaurantError || !restaurant)) {
    return <Navigate to={ROUTES.bookings} replace />
  }
  if (!restaurant) {
    return <Navigate to={ROUTES.bookings} replace />
  }

  const formattedDate = formatDate(date)
  const timeOptions = restaurant.availableTimes.length > 0 ? restaurant.availableTimes : [...TIME_SLOT_OPTIONS]

  const handleCancel = () => {
    cancelReservation.mutate(ref, {
      onSuccess: () => {
        setLocallyCancelled(true)
        cancelConfirm.close()
      },
    })
  }

  // NOTE: the Backend's PATCH /user/reservations/:id only accepts `notes`
  // and/or `status: "cancelled"` (FLUTTER_GUIDE.md §5) — there's no endpoint
  // yet to change date/time/party size, so "Modify reservation" stays a
  // local-only UI affordance (as it was before this integration) rather than
  // a real mutation. TODO: wire this up once the Backend exposes it.
  const handleModify = () => {
    setModified(true)
    modifyPanel.close()
  }

  if (status === 'cancelled') {
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
            <CheckIcon className="size-4 text-sage shrink-0" />
            <p className="text-sm text-sage font-medium">{t('manageBooking.bookingUpdated')}</p>
          </div>
        )}

        {cancelReservation.isError && (
          <div className="bg-destructive/10 rounded-xl p-3 mb-5">
            <p className="text-sm text-destructive font-medium">
              {cancelReservation.error instanceof ApiError ? cancelReservation.error.message : t('manageBooking.cancelError')}
            </p>
          </div>
        )}

        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-sm font-medium ${
          status === 'confirmed' || status === 'active' ? 'bg-sage-light text-sage' :
          status === 'pending' ? 'bg-gold-light text-gold' :
          status === 'completed' ? 'bg-cream-dark text-ink-muted' :
          'bg-terra-light text-terra'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status === 'pending' ? t('manageBooking.awaitingConfirmation') : t(`bookingStatus.${status}`)}
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
              <Button onClick={handleCancel} className="flex-1 font-semibold" disabled={cancelReservation.isPending}>
                {cancelReservation.isPending ? t('manageBooking.cancelling') : t('manageBooking.yesCancelMyBooking')}
              </Button>
              <Button variant="outline" onClick={cancelConfirm.close} className="flex-1 bg-white">{t('manageBooking.keepMyBooking')}</Button>
            </div>
          </div>
        )}

        {/* Actions — the `status === 'cancelled'` case already returned its own screen above. */}
        {!cancelConfirm.isOpen && (
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
