import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { findRestaurantById } from '@/data/restaurants'
import Chip from '@/components/ui/Chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FormField from '@/components/ui/FormField'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROUTES } from '@/lib/constants'
import { formatDate, unsplashUrl } from '@/lib/format'
import { generateBookingReference, validateContactDetails, type ContactDetailsErrors } from '@/lib/validation'
import { selectItems } from '@/lib/utils'
import type { ContactDetails } from '@/types/booking'

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Nut allergy']
const OCCASION_OPTIONS = ['Birthday', 'Anniversary', 'Date night', 'Business meal', 'Family gathering']
const SEATING_OPTIONS = ['Indoor', 'Outdoor', 'Window table', 'Quiet corner']

export default function Checkout() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const restaurant = findRestaurantById(searchParams.get('restaurantId') ?? undefined)
  const date = searchParams.get('date') || ''
  const time = searchParams.get('time') || ''
  const partySize = searchParams.get('partySize') || '2'

  const [contact, setContact] = useState<ContactDetails>({ firstName: '', lastName: '', phone: '', email: '' })
  const [occasion, setOccasion] = useState('')
  const [dietary, setDietary] = useState('')
  const [seating, setSeating] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [errors, setErrors] = useState<ContactDetailsErrors>({})
  const inlineAuth = useDisclosure()

  if (!restaurant) {
    return <Navigate to={ROUTES.home} replace />
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
    navigate(ROUTES.confirmation, {
      state: {
        restaurantId: restaurant.id,
        date,
        time,
        partySize,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        bookingRef: generateBookingReference(),
      },
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

              {/* Inline auth prompt */}
              {!inlineAuth.isOpen ? (
                <button onClick={inlineAuth.open} className="mt-3 text-xs text-terra font-medium hover:underline">
                  {t('checkout.signInToAutofill')}
                </button>
              ) : (
                <div className="mt-3 bg-cream rounded-lg p-3 border border-border space-y-2">
                  <p className="text-xs font-medium text-ink">{t('checkout.signInToAutofillTitle')}</p>
                  <Input type="email" placeholder={t('checkout.emailAddress')} className="bg-white" />
                  <Input type="password" placeholder={t('login.password')} className="bg-white" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={inlineAuth.close} className="flex-1">{t('checkout.signIn')}</Button>
                    <Button size="sm" variant="ghost" onClick={inlineAuth.close}>{t('checkout.cancel')}</Button>
                  </div>
                </div>
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
              <Button onClick={handleConfirm} size="lg" className="w-full text-base">
                {t('checkout.confirmReservation')}
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
                    <span className="text-base">📅</span>
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <span className="text-base">🕖</span>
                    <span>{time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <span className="text-base">👥</span>
                    <span>{partySize} {Number(partySize) === 1 ? t('checkout.guest') : t('checkout.guests')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <span className="text-base">📍</span>
                    <span className="text-xs">{restaurant.neighborhood}, Phnom Penh</span>
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
                    <span>✓</span>
                    <span>{t('checkout.freeCancellation')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-muted mt-1">
                    <span>✓</span>
                    <span>{t('checkout.noCreditCardRequired')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
