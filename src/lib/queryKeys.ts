/** Central query-key factory so invalidations in one hook can't drift from the keys another hook reads. */
export const queryKeys = {
  restaurants: () => ['restaurants'] as const,
  restaurant: (id?: string) => ['restaurants', id] as const,
  catalogItems: (restaurantId?: string) => ['catalog-items', restaurantId ?? 'all'] as const,
  categories: () => ['categories'] as const,
  services: () => ['services'] as const,
  authMe: () => ['auth', 'me'] as const,
  reservations: () => ['reservations'] as const,
  reservation: (id?: string) => ['reservations', id] as const,
}
