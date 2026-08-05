import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FormField from '@/components/ui/FormField'
import { ROUTES } from '@/lib/constants'
import { unsplashUrl } from '@/lib/format'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(ROUTES.bookings)
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
        <div className="absolute inset-0 bg-gradient-to-br from-ink/80 to-transparent" />
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
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              {t('login.signIn')}
            </button>
            <button
              onClick={() => setMode('register')}
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

            <Button type="submit" size="lg" className="w-full mt-2">
              {mode === 'login' ? t('login.signIn') : t('login.createAccount')}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-faint">{t('login.orContinueWith')}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-ink hover:bg-cream-dark transition-all">
              <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('login.google')}
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-ink hover:bg-cream-dark transition-all">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {t('login.facebook')}
            </button>
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
