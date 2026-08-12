import type { ContactDetails } from '@/types/booking'

const STORAGE_KEY = 'koktable.pendingCheckout'

export interface PendingCheckoutSnapshot {
  restaurantId: string
  date: string
  time: string
  partySize: string
  contact: ContactDetails
  occasion: string
  dietary: string
  seating: string
  specialRequests: string
  /** Mirrors Checkout's own `pendingConfirm` — whether to resume straight into
   * submitting the reservation once restored, vs. just leaving the form filled in
   * (the dialog was opened from the standalone "sign in to autofill" link, not the
   * "Confirm Reservation" gate). */
  autoSubmit: boolean
}

/**
 * Google sign-in is a full-page redirect with no way to carry React state or a "return
 * to this page" path through it (see `Backend/WEB_API_GUIDE.md` §1) — this snapshot is
 * the only way Checkout's in-progress booking survives the round trip to Google and
 * back. sessionStorage, not localStorage: a stale snapshot should only ever survive
 * one tab session, not linger indefinitely across visits.
 */
export function savePendingCheckout(snapshot: PendingCheckoutSnapshot): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // ignore — worst case the user just has to re-fill the form after redirecting back
  }
}

/** Reads and clears the snapshot in one step — it's meant to be consumed exactly once, right after the Google redirect lands back on `?token=` (see `app/App.tsx`). */
export function takePendingCheckout(): PendingCheckoutSnapshot | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(STORAGE_KEY)
    return JSON.parse(raw) as PendingCheckoutSnapshot
  } catch {
    return null
  }
}
