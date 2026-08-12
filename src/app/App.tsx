import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import Home from '@/pages/Home'
import SearchResults from '@/pages/SearchResults'
import RestaurantDetail from '@/pages/RestaurantDetail'
import Checkout from '@/pages/Checkout'
import Confirmation from '@/pages/Confirmation'
import Login from '@/pages/Login'
import MyBookings from '@/pages/MyBookings'
import ManageBooking from '@/pages/ManageBooking'
import NotFound from '@/pages/NotFound'
import { ROUTES } from '@/lib/constants'
import { useAuth } from '@/lib/auth'
import { takePendingCheckout } from '@/lib/pendingCheckout'

const PATHS_WITHOUT_CHROME = new Set<string>([ROUTES.login])
// RestaurantDetail renders a fixed bottom reservation bar below `lg`; the
// footer needs matching bottom padding there or the bar overlaps its text.
const RESTAURANT_DETAIL_PATH = /^\/restaurants\/[^/]+$/

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()
  const showChrome = !PATHS_WITHOUT_CHROME.has(location.pathname)
  const hasMobileStickyBar = RESTAURANT_DETAIL_PATH.test(location.pathname)

  // Guards against React StrictMode's dev-only double-invoke of effects: this effect
  // calls takePendingCheckout(), a one-shot read-and-clear (see lib/pendingCheckout.ts).
  // Without this ref, StrictMode's second invocation (same render, same `token`) would
  // find the snapshot already consumed by the first, fall through to the plain
  // token-strip branch, and its `navigate(..., { replace: true })` would clobber the
  // first invocation's navigate-to-Checkout — which is exactly what happened before
  // this guard was added: signing in from Checkout's Google button landed on Home with
  // the booking silently gone, in dev only.
  const hasHandledTokenRef = useRef(false)

  // The Google OAuth redirect (see the "Continue with Google" link in `pages/Login.tsx`
  // / `components/auth/AuthDialog.tsx`) always lands back on this app's bare origin
  // with `?token=` — the package driving the flow has no way to round-trip a "return
  // to this page" path through it. Pick the token up here rather than in Login so it's
  // caught regardless of which page it lands on, persist it, then strip it from the URL.
  useEffect(() => {
    const token = searchParams.get('token')
    if (!token || hasHandledTokenRef.current) return
    hasHandledTokenRef.current = true
    loginWithToken(token)

    // Checkout stashed its in-progress booking (lib/pendingCheckout.ts) right before
    // sending the browser off to Google, since that redirect can't carry React state
    // through it — hand it back via router state so Checkout can restore the form
    // (and resume straight into submitting, if that's what it was waiting on) instead
    // of the user losing everything they'd filled in just for signing in.
    const pending = takePendingCheckout()
    if (pending) {
      const params = new URLSearchParams({
        restaurantId: pending.restaurantId,
        date: pending.date,
        time: pending.time,
        partySize: pending.partySize,
      })
      navigate(`${ROUTES.checkout}?${params.toString()}`, { replace: true, state: { resumeCheckout: pending } })
      return
    }

    const rest = new URLSearchParams(searchParams)
    rest.delete('token')
    navigate({ pathname: location.pathname, search: rest.toString() }, { replace: true })
  }, [searchParams, loginWithToken, navigate, location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <ScrollToTop />
      {showChrome && <Nav />}

      <main className="flex-1">
        <Routes>
          <Route path={ROUTES.home} element={<Home />} />
          <Route path={ROUTES.restaurants} element={<SearchResults />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path={ROUTES.checkout} element={<Checkout />} />
          <Route path={ROUTES.confirmation} element={<Confirmation />} />
          <Route path={ROUTES.login} element={<Login />} />
          <Route path={ROUTES.bookings} element={<MyBookings />} />
          <Route path="/bookings/:ref" element={<ManageBooking />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showChrome && <Footer mobileStickyBarOffset={hasMobileStickyBar} />}
    </div>
  )
}
