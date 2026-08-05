import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types/booking'

const STATUS_CLASSES: Record<BookingStatus, string> = {
  confirmed: 'bg-sage-light text-sage',
  pending: 'bg-gold-light text-gold',
  cancelled: 'bg-terra-light text-terra',
}

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useTranslation()
  return <Badge className={`h-auto px-2.5 py-1 ${STATUS_CLASSES[status]}`}>{t(`bookingStatus.${status}`)}</Badge>
}
