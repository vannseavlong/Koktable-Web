import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called once sign-in/register succeeds, after the dialog has already been asked to close — lets the caller resume whatever it was waiting on auth for (e.g. Checkout resuming reservation submission). */
  onAuthenticated: () => void
  title: string
  /** Passed straight through to GoogleSignInButton — see its own doc comment. Google is a full-page redirect, so unlike email/password auth above, a caller can't just resume in place afterward; this is its only chance to save anything first. */
  onBeforeGoogleRedirect?: () => void
}

/**
 * Sign-in/register as a modal, for flows that need auth mid-task without dumping the
 * user onto a separate page — e.g. Checkout gating "Confirm Reservation" on being
 * signed in. Owns its own form state; a caller only needs `open`/`onOpenChange` and
 * an `onAuthenticated` callback to resume after success.
 */
export default function AuthDialog({ open, onOpenChange, onAuthenticated, title, onBeforeGoogleRedirect }: AuthDialogProps) {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset on every open, not close, so a lingering error/mode from a previous attempt
  // doesn't flash before the close animation finishes.
  useEffect(() => {
    if (!open) return
    setMode('login')
    setName('')
    setEmail('')
    setPassword('')
    setError(null)
    setIsSubmitting(false)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
      onOpenChange(false)
      onAuthenticated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('checkout.errors.authFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 bg-cream-dark rounded-xl p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
          >
            {t('login.signIn')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
          >
            {t('login.register')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('login.fullNamePlaceholder')}
              required
            />
          )}
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.password')}
            required
          />

          {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t('login.submitting')
              : mode === 'login' ? t('checkout.signIn') : t('login.createAccount')}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-ink-faint">{t('login.orContinueWith')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <GoogleSignInButton onBeforeRedirect={onBeforeGoogleRedirect} />
      </DialogContent>
    </Dialog>
  )
}
