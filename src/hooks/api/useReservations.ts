import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { queryKeys } from '@/lib/queryKeys'
import type { ApiReservation, CreateReservationBody } from '@/types/api'

/** `MyBookings` — fetched only when that route mounts (never eagerly from Nav), gated on auth. */
export function useReservations() {
  const { token } = useAuth()
  return useQuery({
    queryKey: queryKeys.reservations(),
    queryFn: () => apiFetch<{ reservations: ApiReservation[]; total: number }>('/user/reservations?limit=50'),
    enabled: !!token,
  })
}

/** `ManageBooking` — single reservation by id (the `:ref` route param), gated on auth. */
export function useReservation(id: string | undefined) {
  const { token } = useAuth()
  return useQuery({
    queryKey: queryKeys.reservation(id),
    queryFn: () => apiFetch<{ reservation: ApiReservation }>(`/user/reservations/${id}`),
    enabled: !!token && !!id,
  })
}

/** `Checkout`'s "Confirm Reservation" — invalidates only the reservations list, no global refetch. */
export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReservationBody) =>
      apiFetch<{ reservation: ApiReservation }>('/user/reservations', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations() })
    },
  })
}

/** `ManageBooking`'s cancel action — the only mutation regular users can make besides `notes` (see FLUTTER_GUIDE.md §5). */
export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ reservation: ApiReservation }>(`/user/reservations/${id}`, {
        method: 'PATCH',
        body: { status: 'cancelled' },
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations() })
      queryClient.invalidateQueries({ queryKey: queryKeys.reservation(id) })
    },
  })
}
