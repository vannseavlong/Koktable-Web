import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useRestaurantById } from '@/data/restaurants'
import { useCreateReservation } from '@/hooks/api/useReservations'
import Chip from '@/components/ui/Chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FormField from '@/components/ui/FormField'
import AuthDialog from '@/components/auth/AuthDialog'
import CalendarIcon from '@/components/icons/CalendarIcon'
import CheckIcon from '@/components/icons/CheckIcon'
import ClockIcon from '@/components/icons/ClockIcon'
import LocationIcon from '@/components/icons/LocationIcon'
import UsersIcon from '@/components/icons/UsersIcon'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/constants'
import { formatDate, unsplashUrl } from '@/lib/format'
import { validateContactDetails, type ContactDetailsErrors } from '@/lib/validation'
import { selectItems } from '@/lib/utils'
import { savePendingCheckout, type PendingCheckoutSnapshot } from '@/lib/pendingCheckout'
import type { ContactDetails } from '@/types/booking'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Nut allergy']
const OCCASION_OPTIONS = ['Birthday', 'Anniversary', 'Date night', 'Business meal', 'Family gathering']
const SEATING_OPTIONS = ['Indoor', 'Outdoor', 'Window table', 'Quiet corner']

export default function Checkout() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const restaurantId = searchParams.get('restaurantId') ?? undefined
  const { data: restaurant, isLoading: isRestaurantLoading, isError: isRestaurantError } = useRestaurantById(restaurantId)
  const date = searchParams.get('date') || ''
  const time = searchParams.get('time') || ''
  const partySize = searchParams.get('partySize') || '2'

  const [contact, setContact] = useState<ContactDetails>({ firstName: '', lastName: '', phone: '', email: '' })
  const [occasion, setOccasion] = useState('')
  const [dietary, setDietary] = useState('')
  const [seating, setSeating] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [errors, setErrors] = useState<ContactDetailsErrors>({})
  const authDialog = useDisclosure()

  // True when the auth dialog was opened because the user clicked "Confirm
  // Reservation" while signed out — a successful sign-in/register there
  // should resume straight into reservation creation instead of just closing.
  const [pendingConfirm, setPendingConfirm] = useState(false)

  // Set once by the resume-from-Google effect below when the snapshot it restored
  // had autoSubmit: true — a separate effect submits once restaurant data (refetched
  // fresh after the redirect) is actually available, since it can't have been ready
  // yet the instant the form fields were restored.
  const [autoSubmitPending, setAutoSubmitPending] = useState(false)

  const createReservation = useCreateReservation()

  // Restore the booking this page was mid-filling before "Continue with Google" sent
  // the browser away (see lib/pendingCheckout.ts / app/App.tsx) — router state only,
  // consumed once. Clearing it via `replace` afterward means a refresh or back-nav
  // won't reapply (or re-auto-submit) it.
  const resumeCheckout = (location.state as { resumeCheckout?: PendingCheckoutSnapshot } | null)?.resumeCheckout
  useEffect(() => {
    if (!resumeCheckout) return
    setContact(resumeCheckout.contact)
    setOccasion(resumeCheckout.occasion)
    setDietary(resumeCheckout.dietary)
    setSeating(resumeCheckout.seating)
    setSpecialRequests(resumeCheckout.specialRequests)
    if (resumeCheckout.autoSubmit) setAutoSubmitPending(true)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
    // Deliberately empty deps: this should run exactly once, right after mount, off
    // whatever location.state this page was navigated in with — not re-run if
    // `resumeCheckout`/`navigate`/`location` identities change on a later render (by
    // which point the state-clearing call above has already made resumeCheckout undefined).
  }, [])

  // Defined above the early-return guards below (and defensively re-checks `restaurant`
  // itself) so the auto-submit effect just underneath — a hook, so it can't come after
  // a conditional return — is able to call it.
  const submitReservation = () => {
    if (!restaurant) return
    createReservation.mutate(
      {
        restaurant_id: restaurant.id,
        guest_name: `${contact.firstName} ${contact.lastName}`.trim(),
        party_size: Number(partySize),
        start_date: date,
        reservation_time: time,
        notes: specialRequests.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          navigate(ROUTES.confirmation, {
            state: {
              restaurantId: restaurant.id,
              date,
              time,
              partySize,
              name: `${contact.firstName} ${contact.lastName}`,
              email: contact.email,
              bookingRef: res.reservation.reservation_id,
            },
          })
        },
      },
    )
  }

  // Fires once the restored booking (above) both wants to auto-submit and has a loaded
  // restaurant to submit against — the restaurant fetch is still in flight the instant
  // the form fields get restored, so this can't just happen inline in that same effect.
  useEffect(() => {
    if (!autoSubmitPending || isRestaurantLoading || !restaurant) return
    setAutoSubmitPending(false)
    submitReservation()
  }, [autoSubmitPending, isRestaurantLoading, restaurant])

  if (!restaurantId || (!isRestaurantLoading && (isRestaurantError || !restaurant))) {
    return <Navigate to={ROUTES.home} replace />
  }
  if (isRestaurantLoading || !restaurant) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-ink-muted">{t('common.loading')}</p>
      </div>
    )
  }

  const formattedDate = date ? formatDate(date) : t('restaurantDetail.selectADate')

  const errorText = (code?: string) => (code ? t(`checkout.errors.${code}`) : undefined)

  const updateContact = (field: keyof ContactDetails, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleConfirm = () => {
    const validationErrors = validateContactDetails(contact)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    if (!isAuthenticated) {
      setPendingConfirm(true)
      authDialog.open()
      return
    }
    submitReservation()
  }

  // AuthDialog already closed itself by the time this fires — just resume whatever
  // triggered it. Only the "Confirm Reservation" gate (not the standalone "sign in to
  // autofill" link) should fall straight into submitting the reservation.
  const handleAuthenticated = () => {
    if (pendingConfirm) {
      setPendingConfirm(false)
      submitReservation()
    }
  }

  // Google is a full-page redirect (see AuthDialog/GoogleSignInButton) — this is the
  // only chance to save the in-progress booking before the browser leaves the page.
  // `pendingConfirm` carries over as `autoSubmit`: the redirect back re-derives the
  // same "was this the Confirm Reservation gate, or just the autofill link" distinction
  // `handleAuthenticated` above uses for the email/password path.
  const handleBeforeGoogleRedirect = () => {
    savePendingCheckout({
      restaurantId: restaurant.id,
      date,
      time,
      partySize,
      contact,
      occasion,
      dietary,
      seating,
      specialRequests,
      autoSubmit: pendingConfirm,
    })
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate(ROUTES.restaurantDetail(restaurant.id))} className="text-sm text-ink-muted hover:text-ink flex items-center gap-1 mb-6">
          {t('checkout.backToRestaurant')}
        </button>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-8">{t('checkout.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-display font-semibold text-ink mb-4">{t('checkout.contactDetails')}</h2>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <FormField label={t('checkout.firstName')} error={errorText(errors.firstName)}>
                  <Input
                    type="text"
                    value={contact.firstName}
                    onChange={(e) => updateContact('firstName', e.target.value)}
                    placeholder={t('checkout.firstNamePlaceholder')}
                    aria-invalid={!!errors.firstName}
                  />
                </FormField>
                <FormField label={t('checkout.lastName')} error={errorText(errors.lastName)}>
                  <Input
                    type="text"
                    value={contact.lastName}
                    onChange={(e) => updateContact('lastName', e.target.value)}
                    placeholder={t('checkout.lastNamePlaceholder')}
                    aria-invalid={!!errors.lastName}
                  />
                </FormField>
              </div>

              <div className="mb-3">
                <FormField label={t('checkout.phoneNumber')} error={errorText(errors.phone)}>
                  <Input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    placeholder={t('checkout.phonePlaceholder')}
                    aria-invalid={!!errors.phone}
                  />
                </FormField>
              </div>

              <FormField label={t('checkout.emailAddress')} error={errorText(errors.email)}>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  placeholder={t('checkout.emailPlaceholder')}
                  aria-invalid={!!errors.email}
                />
              </FormField>

              {/* Opens the same AuthDialog the "Confirm Reservation" button gates a
                  signed-out guest behind (rendered once, below) — filling in the
                  booking form is no place to ask someone to authenticate inline. */}
              {!isAuthenticated && (
                <button
                  onClick={() => { setPendingConfirm(false); authDialog.open() }}
                  className="mt-3 text-xs text-terra font-medium hover:underline"
                >
                  {t('checkout.signInToAutofill')}
                </button>
              )}
            </div>

            {/* Booking details */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-display font-semibold text-ink mb-4">{t('checkout.bookingDetails')}</h2>

              <FormField label={t('checkout.occasion')}>
                <Select
                  items={selectItems(OCCASION_OPTIONS, ['none', t('checkout.noSpecialOccasion')])}
                  value={occasion || 'none'}
                  onValueChange={(v) => setOccasion(v === 'none' || !v ? '' : v)}
                >
                  <SelectTrigger className="w-full bg-cream">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('checkout.noSpecialOccasion')}</SelectItem>
                    {OCCASION_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="mt-3 mb-3">
                <p className="text-sm font-medium text-ink mb-1.5">{t('checkout.dietaryRequirements')}</p>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((d) => (
                    <Chip key={d} label={d} selected={dietary === d} onClick={() => setDietary(dietary === d ? '' : d)} />
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <FormField label={t('checkout.seatingPreference')}>
                  <Select
                    items={selectItems(SEATING_OPTIONS, ['none', t('checkout.noPreference')])}
                    value={seating || 'none'}
                    onValueChange={(v) => setSeating(v === 'none' || !v ? '' : v)}
                  >
                    <SelectTrigger className="w-full bg-cream">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('checkout.noPreference')}</SelectItem>
                      {SEATING_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label={t('checkout.specialRequests')}>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={t('checkout.specialRequestsPlaceholder')}
                  rows={3}
                  className="bg-cream resize-none"
                />
              </FormField>
            </div>

            <div>
              {createReservation.isError && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-2">
                  {createReservation.error instanceof ApiError ? createReservation.error.message : t('checkout.errors.reservationFailed')}
                </p>
              )}
              <Button onClick={handleConfirm} size="lg" className="w-full text-base" disabled={createReservation.isPending}>
                {createReservation.isPending ? t('checkout.confirming') : t('checkout.confirmReservation')}
              </Button>
              <p className="text-xs text-center text-ink-faint mt-2">
                {t('checkout.agreeToPolicy')}{' '}
                <a href="#" className="text-terra hover:underline">{t('checkout.cancellationPolicy')}</a>
              </p>
            </div>
          </div>

          {/* Booking summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border overflow-hidden sticky top-24">
              <img
                src={unsplashUrl(restaurant.imageId, { width: 600, height: 300 })}
                alt={restaurant.name}
                className="w-full aspect-video object-cover"
              />
              <div className="p-4">
                <h3 className="font-display font-semibold text-ink text-base mb-3">{restaurant.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-ink-muted">
                    <CalendarIcon className="size-4 shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <ClockIcon className="size-4 shrink-0" />
                    <span>{time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <UsersIcon className="size-4 shrink-0" />
                    <span>{partySize} {Number(partySize) === 1 ? t('checkout.guest') : t('checkout.guests')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <LocationIcon className="size-4 shrink-0" />
                    <span className="text-xs">{[restaurant.district, restaurant.city].filter(Boolean).join(', ')}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(ROUTES.restaurantDetail(restaurant.id))}
                  className="text-xs text-terra font-medium mt-3 hover:underline"
                >
                  {t('checkout.editReservation')}
                </button>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-sage">
                    <CheckIcon className="size-3.5 shrink-0" />
                    <span>{t('checkout.freeCancellation')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-muted mt-1">
                    <CheckIcon className="size-3.5 shrink-0" />
                    <span>{t('checkout.noCreditCardRequired')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthDialog
        open={authDialog.isOpen}
        onOpenChange={(open) => {
          if (open) authDialog.open()
          else { authDialog.close(); setPendingConfirm(false) }
        }}
        onAuthenticated={handleAuthenticated}
        onBeforeGoogleRedirect={handleBeforeGoogleRedirect}
        title={pendingConfirm ? t('checkout.signInToConfirmTitle') : t('checkout.signInToAutofillTitle')}
      />
    </div>
  )
}
