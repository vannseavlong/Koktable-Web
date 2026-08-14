import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useRestaurantById } from '@/data/restaurants'
import { useCatalogItems } from '@/hooks/api/useCatalog'
import CheckIcon from '@/components/icons/CheckIcon'
import StarIcon from '@/components/icons/StarIcon'
import Chip from '@/components/ui/Chip'
import PartySizeStepper from '@/components/ui/PartySizeStepper'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { usePartySize } from '@/hooks/usePartySize'
import { ROUTES } from '@/lib/constants'
import { formatPrice, unsplashUrl } from '@/lib/format'

const reviews = [
  { name: 'Sophie M.', rating: 5, date: 'October 2024', text: 'Exceptional Khmer food in a beautiful setting. The fish amok was perfection — silky, aromatic, and beautifully presented. Service was warm and attentive.' },
  { name: 'James T.', rating: 5, date: 'October 2024', text: 'Best meal of our Phnom Penh trip. The lok lak was sublime. Booked via KokTable and the whole process was seamless.' },
  { name: 'Aiko N.', rating: 4, date: 'September 2024', text: 'Lovely atmosphere and genuinely excellent food. The amok mousse starter was a highlight. Slightly long wait for mains but staff were apologetic and accommodating.' },
]

const photoIds = [
  'photo-1414235077428-338989a2e8c0',
  'photo-1559339352-11d035aa65de',
  'photo-1555396273-367ea4eb4db5',
  'photo-1537047902294-62a40c20a6ae',
]

export default function RestaurantDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: restaurant, isLoading: isRestaurantLoading, isError: isRestaurantError } = useRestaurantById(id)
  const { data: catalogData, isLoading: isCatalogLoading } = useCatalogItems(restaurant?.id, { enabled: !!restaurant })

  const [activeMenu, setActiveMenu] = useState<'product' | 'service'>('product')
  const [date, setDate] = useState('')
  const { partySize, increment, decrement } = usePartySize()
  const [selectedTime, setSelectedTime] = useState('')

  if (!isRestaurantLoading && (isRestaurantError || !restaurant)) {
    return <Navigate to={ROUTES.restaurants} replace />
  }
  if (isRestaurantLoading || !restaurant) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-ink-muted">{t('common.loading')}</p>
      </div>
    )
  }

  const catalogItems = catalogData?.items ?? []
  const menuSections = [
    { key: 'product' as const, label: t('restaurantDetail.menuProducts'), items: catalogItems.filter((i) => i.item_type === 'product') },
    { key: 'service' as const, label: t('restaurantDetail.menuServices'), items: catalogItems.filter((i) => i.item_type === 'service') },
  ].filter((section) => section.items.length > 0)
  const activeItems = menuSections.find((s) => s.key === activeMenu)?.items ?? menuSections[0]?.items ?? []

  const handleReserve = () => {
    const params = new URLSearchParams({
      restaurantId: restaurant.id,
      date,
      time: selectedTime,
      partySize: String(partySize),
    })
    navigate(`${ROUTES.checkout}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Photo gallery */}
      <div className="bg-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => navigate(ROUTES.restaurants)} className="text-ink-faint text-sm hover:text-white transition-colors flex items-center gap-1 mb-4">
            {t('restaurantDetail.backToResults')}
          </button>
          <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden" style={{ height: 340 }}>
            <div className="col-span-2 row-span-2 overflow-hidden">
              <img
                src={unsplashUrl(photoIds[0], { width: 800, height: 500 })}
                alt={restaurant.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {photoIds.slice(1, 4).map((photoId) => (
              <div key={photoId} className="overflow-hidden">
                <img
                  src={unsplashUrl(photoId, { width: 400, height: 250 })}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight">{restaurant.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {restaurant.cuisine.map((c) => (
                      <span key={c} className="text-sm text-ink-muted bg-cream-dark rounded-full px-3 py-0.5">{c}</span>
                    ))}
                    <span className="text-ink-faint">·</span>
                    <span className="text-sm text-ink-muted">{restaurant.district || restaurant.city}</span>
                    <span className="text-ink-faint">·</span>
                    <span className="text-sm font-medium text-ink-muted">{formatPrice(restaurant.priceLevel)}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <StarIcon className="size-4 text-yellow-500 shrink-0" />
                    <span className="font-display font-semibold text-xl text-ink">{restaurant.rating}</span>
                  </div>
                  <p className="text-xs text-ink-faint">{restaurant.reviewCount} {t('restaurantDetail.reviews')}</p>
                </div>
              </div>
              <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${restaurant.openNow ? 'text-sage' : 'text-terra'}`}>
                <span className={`w-2 h-2 rounded-full ${restaurant.openNow ? 'bg-sage' : 'bg-terra'}`} />
                {restaurant.openNow ? t('restaurantDetail.openNow') : t('restaurantDetail.currentlyClosed')}
              </div>
              <p className="text-ink-muted text-sm leading-relaxed mt-3 max-w-2xl">{restaurant.description}</p>
            </div>

            {/* Menu */}
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold text-ink mb-4">{t('restaurantDetail.menu')}</h2>
              {isCatalogLoading ? (
                <p className="text-sm text-ink-muted">{t('common.loading')}</p>
              ) : menuSections.length === 0 ? (
                <div className="bg-cream rounded-lg p-3 text-center">
                  <p className="text-sm text-ink-faint">{t('restaurantDetail.menuEmpty')}</p>
                </div>
              ) : (
                <>
                  {menuSections.length > 1 && (
                    <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                      {menuSections.map((section) => (
                        <button
                          key={section.key}
                          onClick={() => setActiveMenu(section.key)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            activeMenu === section.key ? 'bg-terra text-white' : 'bg-cream-dark text-ink-muted hover:bg-border'
                          }`}
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    {activeItems.map((item) => (
                      <div key={item.item_id} className="flex items-start justify-between gap-4 bg-white rounded-xl p-4 border border-border">
                        <div>
                          <h4 className="font-medium text-ink text-sm">{item.name}</h4>
                          {item.description && <p className="text-xs text-ink-faint mt-0.5">{item.description}</p>}
                        </div>
                        <span className="font-mono text-sm text-ink-muted shrink-0">${item.price_from}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Reviews */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-ink">{t('restaurantDetail.reviewsHeading')}</h2>
                <div className="flex items-center gap-2">
                  <StarIcon className="size-4 text-yellow-500 shrink-0" />
                  <span className="font-semibold text-ink">{restaurant.rating}</span>
                  <span className="text-ink-faint text-sm">({restaurant.reviewCount})</span>
                </div>
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.name} className="bg-white rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-terra-light flex items-center justify-center">
                          <span className="text-xs font-semibold text-terra">{review.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{review.name}</p>
                          <p className="text-xs text-ink-faint">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} className={`size-3.5 ${i < review.rating ? 'text-yellow-500' : 'text-border'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold text-ink mb-4">{t('restaurantDetail.hours')}</h2>
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                {Object.entries(restaurant.hours).map(([day, hours], i) => (
                  <div key={day} className={`flex justify-between px-4 py-2.5 text-sm ${i < Object.keys(restaurant.hours).length - 1 ? 'border-b border-border' : ''} ${day === 'Friday' || day === 'Saturday' ? 'bg-cream' : ''}`}>
                    <span className="font-medium text-ink">{day}</span>
                    <span className={hours === 'Closed' ? 'text-terra' : 'text-ink-muted'}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & contact */}
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold text-ink mb-4">{t('restaurantDetail.location')}</h2>
              <div className="bg-sage-light rounded-2xl overflow-hidden mb-4" style={{ height: 200 }}>
                <img
                  src={unsplashUrl('photo-1533929736458-ca588d08c8be', { width: 800, height: 300 })}
                  alt="Map location"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white rounded-xl p-4 border border-border">
                  <p className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-1">{t('restaurantDetail.address')}</p>
                  <p className="text-sm text-ink">{restaurant.address}</p>
                  <button className="text-xs text-terra font-medium mt-2 hover:underline">{t('restaurantDetail.getDirections')}</button>
                </div>
                <div className="flex-1 bg-white rounded-xl p-4 border border-border">
                  <p className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-1">{t('restaurantDetail.phone')}</p>
                  <p className="text-sm text-ink">{restaurant.phone}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-4">{t('restaurantDetail.amenities')}</h2>
              <div className="flex flex-wrap gap-2">
                {restaurant.amenities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 text-sm text-ink-muted bg-cream-dark rounded-full px-3 py-1.5 border border-border">
                    <CheckIcon className="size-3.5 shrink-0" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reservation widget — sticky sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-border shadow-lg p-5">
                <h3 className="font-display font-semibold text-ink text-lg mb-4">{t('restaurantDetail.makeAReservation')}</h3>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1">{t('restaurantDetail.date')}</label>
                    <DatePicker value={date} onChange={setDate} placeholder={t('restaurantDetail.selectADate')} className="w-full bg-cream" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1">{t('restaurantDetail.partySize')}</label>
                    <PartySizeStepper value={partySize} onIncrement={increment} onDecrement={decrement} />
                  </div>
                </div>

                {restaurant.availableTimes.length > 0 ? (
                  <>
                    <p className="text-xs font-medium text-ink-muted mb-2">{t('restaurantDetail.availableTimes')}</p>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                      {restaurant.availableTimes.map((slot) => (
                        <Chip
                          key={slot}
                          label={slot}
                          tone="highlight"
                          selected={selectedTime === slot}
                          onClick={() => setSelectedTime(slot)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-cream rounded-lg p-3 mb-4 text-center">
                    <p className="text-sm text-ink-faint">{t('restaurantDetail.fullyBooked')}</p>
                    <button className="text-xs text-terra font-medium mt-1">{t('restaurantDetail.tryAnotherDate')}</button>
                  </div>
                )}

                <Button
                  onClick={handleReserve}
                  disabled={restaurant.availableTimes.length === 0 || !date || !(selectedTime)}
                  size="lg"
                  className="w-full"
                >
                  {t('restaurantDetail.reserveATable')}
                </Button>

                <p className="text-xs text-center text-ink-faint mt-3">
                  {!date ? t('restaurantDetail.pickADateToContinue') : t('restaurantDetail.noCreditCard')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 flex items-center justify-between gap-3 z-40">
        <div>
          <p className="text-sm font-semibold text-ink">{restaurant.name}</p>
          <div className="flex items-center gap-1">
            <StarIcon className="size-3 text-yellow-500 shrink-0" />
            <span className="text-xs text-ink-muted">{restaurant.rating} · {restaurant.availableTimes.length} {t('restaurantDetail.timesAvailable')}</span>
          </div>
        </div>
        <Button onClick={handleReserve} disabled={restaurant.availableTimes.length === 0 || !date || !(selectedTime)}>
          {t('restaurantDetail.reserve')}
        </Button>
      </div>
      <div className="lg:hidden h-20" />
    </div>
  )
}
