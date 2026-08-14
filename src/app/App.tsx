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
// RestaurantDetail's fixed bottom reservation bar (below `lg`) needs matching footer padding to avoid overlap.
const RESTAURANT_DETAIL_PATH = /^\/restaurants\/[^/]+$/

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()
  const showChrome = !PATHS_WITHOUT_CHROME.has(location.pathname)
  const hasMobileStickyBar = RESTAURANT_DETAIL_PATH.test(location.pathname)

  // Prevents StrictMode's dev-only double-invoke from re-consuming takePendingCheckout() and clobbering the first navigate.
  const hasHandledTokenRef = useRef(false)

  // Picks up the `?token=` the Google OAuth redirect lands on this app's bare origin with, regardless of which page it hits, then strips it.
  useEffect(() => {
    const token = searchParams.get('token')
    if (!token || hasHandledTokenRef.current) return
    hasHandledTokenRef.current = true
    loginWithToken(token)

    // Hands Checkout's stashed pending booking back via router state so the form can be restored after the OAuth redirect.
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
