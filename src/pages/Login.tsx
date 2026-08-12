import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FormField from '@/components/ui/FormField'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/constants'
import { unsplashUrl } from '@/lib/format'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = searchParams.get('next') || ROUTES.bookings

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
      navigate(next, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('login.errors.generic'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-ink">
        <img
          src={unsplashUrl('photo-1559339352-11d035aa65de', { width: 900, height: 1200 })}
          alt="Phnom Penh dining"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-linear-to-br from-ink/80 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-3xl font-semibold text-white leading-snug mb-3">
            {t('login.quote')}
          </p>
          <p className="text-ink-faint text-sm">{t('login.quoteSubtitle')}</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link to={ROUTES.home} className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-full bg-terra flex items-center justify-center">
                <span className="text-white text-xs font-display font-semibold">T</span>
              </div>
              <span className="font-display font-semibold text-base text-ink">
                Kok<span className="text-terra">Table</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-semibold text-ink mb-1">
              {mode === 'login' ? t('login.welcomeBack') : t('login.createYourAccount')}
            </h1>
            <p className="text-sm text-ink-muted">
              {mode === 'login' ? t('login.signInSubtitle') : t('login.registerSubtitle')}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 bg-cream-dark rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              {t('login.signIn')}
            </button>
            <button
              onClick={() => { setMode('register'); setError(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              {t('login.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <FormField label={t('login.fullName')}>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('login.fullNamePlaceholder')}
                    required
                  />
                </FormField>
                <FormField label={t('login.phoneNumber')}>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('login.phonePlaceholder')}
                  />
                </FormField>
              </>
            )}
            <FormField label={t('login.emailAddress')}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </FormField>
            <FormField
              label={t('login.password')}
              action={mode === 'login' && (
                <button type="button" className="text-xs text-terra hover:underline">{t('login.forgotPassword')}</button>
              )}
            >
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint hover:text-ink-muted"
                >
                  {showPassword ? t('login.hide') : t('login.show')}
                </button>
              </div>
            </FormField>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting
                ? t('login.submitting')
                : mode === 'login' ? t('login.signIn') : t('login.createAccount')}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-faint">{t('login.orContinueWith')}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-1 gap-3">
            <GoogleSignInButton />
            {/* Facebook login/register — not wired up yet, commented out until the Backend supports it. */}
            {/* <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-ink hover:bg-cream-dark transition-all">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {t('login.facebook')}
            </button> */}
          </div>

          {mode === 'register' && (
            <p className="text-xs text-center text-ink-faint mt-4">
              {t('login.agreeToTerms')}{' '}
              <a href="#" className="text-terra hover:underline">{t('login.termsOfService')}</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
