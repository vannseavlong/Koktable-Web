import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useRestaurants, neighborhoods, cuisines } from '@/data/restaurants'
import RestaurantCard from '@/components/restaurant/RestaurantCard'
import Chip from '@/components/ui/Chip'
import PartySizeStepper from '@/components/ui/PartySizeStepper'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Rating from '@/components/ui/Rating'
import { usePartySize } from '@/hooks/usePartySize'
import { ROUTES, TIME_SLOT_OPTIONS } from '@/lib/constants'
import { unsplashUrl } from '@/lib/format'
import { selectItems } from '@/lib/utils'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchMode, setSearchMode] = useState<'location' | 'cuisine'>('location')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const { partySize, increment, decrement } = usePartySize()
  const { data: restaurants = [], isLoading: isRestaurantsLoading } = useRestaurants()

  const featured = restaurants.filter((r) => r.rating >= 4.5).slice(0, 3)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchMode === 'location' && selectedNeighborhood) params.set('neighborhood', selectedNeighborhood)
    if (searchMode === 'cuisine' && selectedCuisine) params.set('cuisine', selectedCuisine)
    if (date) params.set('date', date)
    if (time) params.set('time', time)
    params.set('partySize', String(partySize))
    navigate(`${ROUTES.restaurants}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0">
          <img
            src={unsplashUrl('photo-1414235077428-338989a2e8c0', { width: 1600, height: 900 })}
            alt="Phnom Penh restaurant dining"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-linear-to-b from-ink/60 via-ink/40 to-ink/90" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="inline-flex items-center gap-2 bg-terra/20 border border-terra/40 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terra animate-pulse" />
            <span className="text-xs font-medium text-terra-light tracking-wide uppercase">{t('home.eyebrow')}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.1] mb-4 max-w-2xl">
            {t('home.title')} <span className="text-gold italic">{t('home.titleHighlight')}</span>
          </h1>
          <p className="text-ink-faint text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
            {t('home.subtitle')}
          </p>

          {/* Search widget */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl max-w-2xl">
            <div className="flex gap-1 mb-4 bg-cream rounded-lg p-1 w-fit">
              <button
                onClick={() => setSearchMode('location')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  searchMode === 'location' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {t('home.byLocation')}
              </button>
              <button
                onClick={() => setSearchMode('cuisine')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  searchMode === 'cuisine' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {t('home.byCuisine')}
              </button>
            </div>

            {searchMode === 'location' ? (
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <Select
                  items={selectItems(neighborhoods.map((n) => n.name), ['all', t('home.allNeighborhoods')])}
                  value={selectedNeighborhood || 'all'}
                  onValueChange={(v) => setSelectedNeighborhood(v === 'all' || !v ? '' : v)}
                >
                  <SelectTrigger className="w-full bg-cream">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('home.allNeighborhoods')}</SelectItem>
                    {neighborhoods.map((n) => (
                      <SelectItem key={n.name} value={n.name}>{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {cuisines.map((c) => (
                  <Chip
                    key={c.name}
                    label={c.name}
                    icon={c.emoji}
                    selected={selectedCuisine === c.name}
                    onClick={() => setSelectedCuisine(selectedCuisine === c.name ? '' : c.name)}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <DatePicker value={date} onChange={setDate} placeholder={t('home.anyDate')} className="flex-1 bg-cream" />
              <Select
                items={selectItems([...TIME_SLOT_OPTIONS], ['any', t('home.anyTime')])}
                value={time || 'any'}
                onValueChange={(v) => setTime(v === 'any' || !v ? '' : v)}
              >
                <SelectTrigger className="flex-1 bg-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t('home.anyTime')}</SelectItem>
                  {TIME_SLOT_OPTIONS.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <PartySizeStepper value={partySize} onIncrement={increment} onDecrement={decrement} />
            </div>

            <Button onClick={handleSearch} size="lg" className="w-full">
              {t('home.findAvailableTables')}
            </Button>
          </div>
        </div>
      </section>

      {/* Featured restaurants */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-medium text-terra tracking-widest uppercase mb-1">{t('home.editorsPicks')}</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">{t('home.trendingThisWeek')}</h2>
          </div>
          <Button variant="ghost" size="sm" className="px-0! hidden sm:inline-flex" onClick={() => navigate(ROUTES.restaurants)}>
            {t('home.viewAll')}
          </Button>
        </div>

        {isRestaurantsLoading ? (
          <p className="text-sm text-ink-muted">{t('common.loading')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featured.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}

        <div className="mt-4 sm:hidden text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.restaurants)}>{t('home.viewAllRestaurants')}</Button>
        </div>
      </section>

      {/* Browse by neighborhood */}
      <section className="bg-cream-dark py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-medium text-terra tracking-widest uppercase mb-1">{t('home.exploreTheCity')}</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">{t('home.browseByNeighbourhood')}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {neighborhoods.map((n) => (
              <button
                key={n.name}
                onClick={() => navigate(ROUTES.restaurants)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-border"
              >
                <img
                  src={unsplashUrl(n.imageId, { width: 400, height: 400 })}
                  alt={n.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <h3 className="font-display font-semibold text-white text-sm sm:text-base">{n.name}</h3>
                  <p className="text-xs text-ink-faint mt-0.5 hidden sm:block">{n.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recently viewed */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-8">
          <p className="text-xs font-medium text-terra tracking-widest uppercase mb-1">{t('home.pickUpWhereYouLeftOff')}</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">{t('home.recentlyViewed')}</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3">
          {restaurants.slice(3, 6).map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(ROUTES.restaurantDetail(r.id))}
              className="group text-left flex-none w-64 sm:w-auto flex gap-3 bg-white rounded-xl p-3 border border-border hover:border-terra/30 hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-border shrink-0">
                <img
                  src={unsplashUrl(r.imageId, { width: 120, height: 120 })}
                  alt={r.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-ink text-sm leading-tight truncate">{r.name}</h3>
                <p className="text-xs text-ink-faint mt-0.5">{r.neighborhood}</p>
                <div className="mt-1">
                  <Rating value={r.rating} reviewCount={r.reviewCount} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-terra text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">{t('home.ctaTitle')}</h2>
            <p className="text-terra-light text-sm">{t('home.ctaSubtitle')}</p>
          </div>
          <button className="px-6 py-3 bg-white text-terra rounded-xl font-semibold text-sm hover:bg-cream transition-all shrink-0 shadow-lg">
            {t('home.ctaButton')}
          </button>
        </div>
      </section>
    </div>
  )
}
