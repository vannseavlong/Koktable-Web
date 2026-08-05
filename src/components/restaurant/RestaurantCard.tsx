import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Restaurant } from '@/types/restaurant'
import { ROUTES } from '@/lib/constants'
import { formatPrice, unsplashUrl } from '@/lib/format'

export default function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const { t } = useTranslation()

  return (
    <Link
      to={ROUTES.restaurantDetail(restaurant.id)}
      className="group block text-left bg-white rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-terra/30 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-border">
        <img
          src={unsplashUrl(restaurant.imageId, { width: 600, height: 400 })}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-xs font-semibold text-ink">{restaurant.rating}</span>
        </div>
        {restaurant.openNow && (
          <div className="absolute top-3 left-3 bg-sage/90 backdrop-blur-sm rounded-full px-2 py-0.5">
            <span className="text-xs font-medium text-white">{t('restaurantCard.openNow')}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-display font-semibold text-ink text-base leading-tight">{restaurant.name}</h3>
          <span className="text-xs text-ink-faint font-medium ml-2 shrink-0">{formatPrice(restaurant.priceLevel)}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {restaurant.cuisine.map((c) => (
            <span key={c} className="text-xs text-ink-muted bg-cream rounded-full px-2 py-0.5">{c}</span>
          ))}
          <span className="text-xs text-ink-faint">· {restaurant.neighborhood}</span>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">{t('restaurantCard.knownFor', { text: restaurant.knownFor })}</p>
        {restaurant.availableTimes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {restaurant.availableTimes.slice(0, 3).map((time) => (
              <span key={time} className="text-xs bg-terra-light text-terra rounded-full px-2 py-0.5 font-medium">{time}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
