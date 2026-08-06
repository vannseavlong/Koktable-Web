/** Central query-key factory so invalidations in one hook can't drift from the keys another hook reads. */
export const queryKeys = {
  // filters keyed in so useRestaurants({ city }) and useRestaurants({ city, district })
  // cache independently instead of colliding on a shared 'restaurants' key.
  restaurants: (filters: { city?: string; district?: string } = {}) => ['restaurants', filters] as const,
  restaurant: (id?: string) => ['restaurants', id] as const,
  catalogItems: (restaurantId?: string) => ['catalog-items', restaurantId ?? 'all'] as const,
  categories: () => ['categories'] as const,
  services: () => ['services'] as const,
  authMe: () => ['auth', 'me'] as const,
  reservations: () => ['reservations'] as const,
  reservation: (id?: string) => ['reservations', id] as const,
}
