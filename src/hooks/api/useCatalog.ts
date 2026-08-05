import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import type { ApiCatalogItem, ApiCategory, ApiService } from '@/types/api'

// These change rarely — a long staleTime means navigating between pages
// doesn't refire the request, only a full reload or explicit invalidation does.
const CATALOG_STALE_TIME = 10 * 60 * 1000

/**
 * Cross-restaurant catalog feed (`GET /user/catalog-items`) when `restaurantId`
 * is omitted, or one restaurant's catalog (`GET /user/restaurants/:id/catalog-items`)
 * when provided. Not yet consumed by any page — `RestaurantDetail`'s menu is
 * still mock content (see AGENTS.md) — built ahead of that wiring per Web/TODO.md.
 */
export function useCatalogItems(restaurantId?: string) {
  return useQuery({
    queryKey: queryKeys.catalogItems(restaurantId),
    queryFn: () =>
      restaurantId
        ? apiFetch<{ items: ApiCatalogItem[] }>(`/user/restaurants/${restaurantId}/catalog-items`)
        : apiFetch<{ items: ApiCatalogItem[] }>('/user/catalog-items'),
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
