/** Central query-key factory so invalidations in one hook can't drift from the keys another hook reads. */
export const queryKeys = {
  // filters keyed in so useRestaurants({ cityId }) and useRestaurants({ cityId, districtId })
  // cache independently instead of colliding on a shared 'restaurants' key.
  restaurants: (filters: { cityId?: string; districtId?: string; cuisineId?: string } = {}) => ['restaurants', filters] as const,
  // Separate from `restaurants` above so the unpaginated cache (Home, etc.) and the
  // infinite-scroll cache (SearchResults) never collide on the same key.
  restaurantsInfinite: (filters: { cityId?: string; districtId?: string; cuisineId?: string } = {}) => ['restaurants', 'infinite', filters] as const,
  restaurant: (id?: string) => ['restaurants', id] as const,
  catalogItems: (restaurantId?: string) => ['catalog-items', restaurantId ?? 'all'] as const,
  categories: () => ['categories'] as const,
  services: () => ['services'] as const,
  cities: () => ['cities'] as const,
  districts: (cityId?: string) => ['districts', cityId ?? 'all'] as const,
  cuisines: () => ['cuisines'] as const,
  authMe: () => ['auth', 'me'] as const,
  reservations: () => ['reservations'] as const,
  reservation: (id?: string) => ['reservations', id] as const,
}
