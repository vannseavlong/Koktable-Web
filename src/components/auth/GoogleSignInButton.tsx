import { useTranslation } from 'react-i18next'
import { API_BASE_URL } from '@/lib/api'

// Full-page navigation (not a fetch) into the Backend's Google OAuth redirect flow —
// it lands back on this app's bare origin with `?token=`, picked up in `app/App.tsx`.
// See `Backend/WEB_API_GUIDE.md` §1.
const GOOGLE_LOGIN_URL = `${API_BASE_URL}/user/web/auth/google`

interface GoogleSignInButtonProps {
  /** Fires synchronously right before the browser navigates away to Google — the only
   * hook a caller gets, since this is a full-page redirect (not a click handled by
   * React Router) and anything in component state would otherwise just be lost. */
  onBeforeRedirect?: () => void
}

/** Shared "Continue with Google" link — used by both the standalone Login page and AuthDialog, so the OAuth entry point looks and behaves identically everywhere it appears. */
export default function GoogleSignInButton({ onBeforeRedirect }: GoogleSignInButtonProps) {
  const { t } = useTranslation()
  return (
    <a
      href={GOOGLE_LOGIN_URL}
      onClick={onBeforeRedirect}
      className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-ink hover:bg-cream-dark transition-all"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {t('login.google')}
    </a>
  )
}
