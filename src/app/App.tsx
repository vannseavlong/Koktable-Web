import { Route, Routes, useLocation } from 'react-router-dom'
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

const PATHS_WITHOUT_CHROME = new Set<string>([ROUTES.login])
// RestaurantDetail renders a fixed bottom reservation bar below `lg`; the
// footer needs matching bottom padding there or the bar overlaps its text.
const RESTAURANT_DETAIL_PATH = /^\/restaurants\/[^/]+$/

export default function App() {
  const location = useLocation()
  const showChrome = !PATHS_WITHOUT_CHROME.has(location.pathname)
  const hasMobileStickyBar = RESTAURANT_DETAIL_PATH.test(location.pathname)

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
