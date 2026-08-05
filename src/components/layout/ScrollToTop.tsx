import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Mirrors native browser navigation: scroll to top whenever the route changes. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}
