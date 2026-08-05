import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n'

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const items = Object.fromEntries(SUPPORTED_LANGUAGES.map((lng) => [lng, t(`language.${lng}`)]))

  return (
    <Select
      items={items}
      value={i18n.resolvedLanguage ?? 'en'}
      onValueChange={(v) => v && i18n.changeLanguage(v as SupportedLanguage)}
    >
      <SelectTrigger size="sm" className={`border-none bg-transparent shadow-none px-2 ${className ?? ''}`} aria-label={t('language.label')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((lng) => (
          <SelectItem key={lng} value={lng}>{t(`language.${lng}`)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
