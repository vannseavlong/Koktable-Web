import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useRestaurants, cuisines, neighborhoods } from '@/data/restaurants'
import RestaurantListItem from '@/components/restaurant/RestaurantListItem'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TIME_SLOT_OPTIONS } from '@/lib/constants'
import { unsplashUrl } from '@/lib/format'
import { selectItems } from '@/lib/utils'

export default function SearchResults() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') ?? '')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(searchParams.get('neighborhood') ?? '')
  const [maxPrice, setMaxPrice] = useState(4)
  const [minRating, setMinRating] = useState(0)
  const [openNow, setOpenNow] = useState(false)
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'price'>('relevance')
  const [date, setDate] = useState(searchParams.get('date') ?? '')
  const [time, setTime] = useState(searchParams.get('time') ?? '')
  const { data: restaurants = [], isLoading: isRestaurantsLoading } = useRestaurants()

  const filtered = restaurants
    .filter((r) => {
      if (selectedCuisine && !r.cuisine.includes(selectedCuisine)) return false
      if (selectedNeighborhood && r.neighborhood !== selectedNeighborhood) return false
      if (r.priceLevel > maxPrice) return false
      if (r.rating < minRating) return false
      if (openNow && !r.openNow) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'price') return a.priceLevel - b.priceLevel
      return b.rating * Math.log(b.reviewCount) - a.rating * Math.log(a.reviewCount)
    })

  return (
    <div className="min-h-screen bg-cream">
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1 flex-wrap">
              <Select
                items={selectItems(cuisines.map((c) => c.name), ['all', t('search.allCuisines')])}
                value={selectedCuisine || 'all'}
                onValueChange={(v) => setSelectedCuisine(v === 'all' || !v ? '' : v)}
              >
                <SelectTrigger className="bg-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.allCuisines')}</SelectItem>
                  {cuisines.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select
                items={selectItems(neighborhoods.map((n) => n.name), ['all', t('search.allAreas')])}
                value={selectedNeighborhood || 'all'}
                onValueChange={(v) => setSelectedNeighborhood(v === 'all' || !v ? '' : v)}
              >
                <SelectTrigger className="bg-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.allAreas')}</SelectItem>
                  {neighborhoods.map((n) => <SelectItem key={n.name} value={n.name}>{n.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select
                items={{ '1': '$', '2': '$$', '3': '$$$', '4': '$$$$' }}
                value={String(maxPrice)}
                onValueChange={(v) => setMaxPrice(Number(v))}
              >
                <SelectTrigger className="bg-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">$</SelectItem>
                  <SelectItem value="2">$$</SelectItem>
                  <SelectItem value="3">$$$</SelectItem>
                  <SelectItem value="4">$$$$</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setOpenNow(!openNow)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  openNow ? 'bg-terra text-white border-terra' : 'border-border text-ink-muted hover:border-terra'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {t('search.openNow')}
              </button>
            </div>

            <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
              <DatePicker value={date} onChange={setDate} placeholder={t('search.anyDate')} className="bg-cream w-36" />
              <Select
                items={selectItems([...TIME_SLOT_OPTIONS], ['any', t('search.anyTime')])}
                value={time || 'any'}
                onValueChange={(v) => setTime(v === 'any' || !v ? '' : v)}
              >
                <SelectTrigger className="bg-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t('search.anyTime')}</SelectItem>
                  {TIME_SLOT_OPTIONS.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select
                items={{ relevance: t('search.sortRelevance'), rating: t('search.sortRating'), price: t('search.sortPrice') }}
                value={sortBy}
                onValueChange={(v) => setSortBy((v || 'relevance') as typeof sortBy)}
              >
                <SelectTrigger className="bg-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">{t('search.sortRelevance')}</SelectItem>
                  <SelectItem value="rating">{t('search.sortRating')}</SelectItem>
                  <SelectItem value="price">{t('search.sortPrice')}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm transition-all ${viewMode === 'list' ? 'bg-terra text-white' : 'bg-white text-ink-muted hover:bg-cream'}`}
                  title={t('search.listView')}
                >
                  ☰
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 text-sm transition-all ${viewMode === 'map' ? 'bg-terra text-white' : 'bg-white text-ink-muted hover:bg-cream'}`}
                  title={t('search.mapView')}
                >
                  ⊞
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ink-muted">
            {t('search.resultsFound', { count: filtered.length })}
            {selectedNeighborhood && <span> {t('search.inNeighborhood')} <span className="text-terra font-medium">{selectedNeighborhood}</span></span>}
            {selectedCuisine && <span> · <span className="text-terra font-medium">{selectedCuisine}</span></span>}
          </p>
        </div>

        {viewMode === 'list' ? (
          isRestaurantsLoading ? (
            <p className="text-sm text-ink-muted text-center py-24">{t('common.loading')}</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">{t('search.noResultsTitle')}</h3>
              <p className="text-ink-muted text-sm mb-6">{t('search.noResultsSubtitle')}</p>
              <Button onClick={() => { setSelectedCuisine(''); setSelectedNeighborhood(''); setOpenNow(false); setMaxPrice(4) }}>
                {t('search.clearFilters')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r) => (
                <RestaurantListItem key={r.id} restaurant={r} />
              ))}
            </div>
          )
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-sage-light border border-border" style={{ height: 500 }}>
            <img
              src={unsplashUrl('photo-1533929736458-ca588d08c8be', { width: 1200, height: 600 })}
              alt="Map of Phnom Penh"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-xs">
                <p className="text-2xl mb-2">🗺️</p>
                <h3 className="font-display font-semibold text-ink mb-1">{t('search.mapTitle')}</h3>
                <p className="text-sm text-ink-muted">{t('search.mapComingSoon', { count: filtered.length })}</p>
              </div>
            </div>
            {[
              { top: '35%', left: '42%', label: 'Malis' },
              { top: '28%', left: '55%', label: 'Topaz' },
              { top: '50%', left: '38%', label: 'Bassac Lane' },
              { top: '22%', left: '65%', label: 'Riverside' },
            ].map((pin) => (
              <div key={pin.label} className="absolute flex flex-col items-center" style={{ top: pin.top, left: pin.left }}>
                <div className="bg-terra text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-md mb-0.5 whitespace-nowrap">
                  {pin.label}
                </div>
                <div className="w-2 h-2 bg-terra rounded-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
