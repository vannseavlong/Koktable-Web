import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Restaurant } from '@/types/restaurant'
import { ROUTES } from '@/lib/constants'
import { formatPrice, unsplashUrl } from '@/lib/format'

export default function RestaurantListItem({ restaurant }: { restaurant: Restaurant }) {
  const { t } = useTranslation()

  return (
    <Link
      to={ROUTES.restaurantDetail(restaurant.id)}
      className="group w-full text-left bg-white rounded-2xl border border-border hover:border-terra/30 hover:shadow-lg transition-all overflow-hidden flex flex-col sm:flex-row"
    >
      <div className="sm:w-56 aspect-[4/3] sm:aspect-auto shrink-0 overflow-hidden bg-border">
        <img
          src={unsplashUrl(restaurant.imageId, { width: 400, height: 300 })}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col sm:flex-row flex-1 p-4 sm:p-5 gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-display font-semibold text-ink text-lg leading-tight">{restaurant.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {restaurant.cuisine.map((c) => (
                  <span key={c} className="text-xs text-ink-muted bg-cream rounded-full px-2 py-0.5">{c}</span>
                ))}
                <span className="text-xs text-ink-faint">·</span>
                <span className="text-xs text-ink-faint">{restaurant.district || restaurant.city}</span>
                <span className="text-xs text-ink-faint">·</span>
                <span className="text-xs font-medium text-ink-muted">{formatPrice(restaurant.priceLevel)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-3 shrink-0">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="font-semibold text-ink text-sm">{restaurant.rating}</span>
              <span className="text-xs text-ink-faint">({restaurant.reviewCount})</span>
            </div>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed line-clamp-2">{restaurant.description}</p>
          <p className="text-xs text-ink-faint mt-1">{t('restaurantCard.knownFor', { text: restaurant.knownFor })}</p>
        </div>

        <div className="sm:w-48 sm:border-l sm:border-border sm:pl-4 shrink-0">
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium mb-3 ${restaurant.openNow ? 'text-sage' : 'text-ink-faint'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${restaurant.openNow ? 'bg-sage' : 'bg-ink-faint'}`} />
            {restaurant.openNow ? t('restaurantCard.openNow') : t('restaurantCard.closed')}
          </div>
          {restaurant.availableTimes.length > 0 ? (
            <>
              <p className="text-xs text-ink-muted mb-2 font-medium">{t('restaurantCard.availableTonight')}</p>
              <div className="flex flex-wrap gap-1.5">
                {restaurant.availableTimes.slice(0, 4).map((time) => (
                  <span key={time} className="text-xs bg-terra-light text-terra rounded-full px-2.5 py-1 font-medium">{time}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-ink-faint">{t('restaurantCard.fullyBookedTonight')}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
