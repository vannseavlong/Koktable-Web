import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import type { ApiCatalogItem, ApiCategory, ApiCity, ApiCuisine, ApiDistrict, ApiService } from '@/types/api'

// These change rarely — a long staleTime means navigating between pages
// doesn't refire the request, only a full reload or explicit invalidation does.
const CATALOG_STALE_TIME = 10 * 60 * 1000

/**
 * Cross-restaurant catalog feed (`GET /user/catalog-items`) when `restaurantId`
 * is omitted, or one restaurant's catalog (`GET /user/restaurants/:id/catalog-items`)
 * when provided. Used by `RestaurantDetail`'s menu section, scoped to one restaurant;
 * pass `enabled: false` to defer the request until the restaurant itself has loaded.
 */
export function useCatalogItems(restaurantId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.catalogItems(restaurantId),
    queryFn: () =>
      restaurantId
        ? apiFetch<{ items: ApiCatalogItem[] }>(`/user/restaurants/${restaurantId}/catalog-items`)
        : apiFetch<{ items: ApiCatalogItem[] }>('/user/catalog-items'),
    enabled: options?.enabled ?? true,
    staleTime: CATALOG_STALE_TIME,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => apiFetch<{ categories: ApiCategory[] }>('/user/categories'),
    staleTime: CATALOG_STALE_TIME,
  })
}

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services(),
    queryFn: () => apiFetch<{ services: ApiService[] }>('/user/services'),
    staleTime: CATALOG_STALE_TIME,
  })
}

/** Canonical city vocabulary (`GET /user/cities`) — populates the city filter dropdown. */
export function useCities() {
  return useQuery({
    queryKey: queryKeys.cities(),
    queryFn: () => apiFetch<{ cities: ApiCity[] }>('/user/cities'),
    staleTime: CATALOG_STALE_TIME,
  })
}

/**
 * Canonical district vocabulary (`GET /user/districts`), optionally scoped to `cityId` for a
 * cascading city→district picker. Stays enabled with no `cityId` (returns every district) since
 * some call sites want the full list; pass the selected city id to scope the result server-side.
 */
export function useDistricts(cityId?: string) {
  return useQuery({
    queryKey: queryKeys.districts(cityId),
    queryFn: () =>
      apiFetch<{ districts: ApiDistrict[] }>(`/user/districts${cityId ? `?city_id=${encodeURIComponent(cityId)}` : ''}`),
    staleTime: CATALOG_STALE_TIME,
  })
}

/** Canonical cuisine vocabulary (`GET /user/cuisines`) — populates the cuisine filter dropdown. */
export function useCuisines() {
  return useQuery({
    queryKey: queryKeys.cuisines(),
    queryFn: () => apiFetch<{ cuisines: ApiCuisine[] }>('/user/cuisines'),
    staleTime: CATALOG_STALE_TIME,
  })
}
