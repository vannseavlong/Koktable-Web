import type { ContactDetails } from '@/types/booking'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/** Values are i18n keys under `checkout.errors.*`, not display text — translate at render time. */
export type ContactDetailsErrors = Partial<Record<keyof ContactDetails, string>>

export function validateContactDetails(values: ContactDetails): ContactDetailsErrors {
  const errors: ContactDetailsErrors = {}
  if (!values.firstName.trim()) errors.firstName = 'firstNameRequired'
  if (!values.lastName.trim()) errors.lastName = 'lastNameRequired'
  if (!values.phone.trim()) errors.phone = 'phoneRequired'
  if (!values.email.trim()) errors.email = 'emailRequired'
  else if (!isValidEmail(values.email)) errors.email = 'emailInvalid'
  return errors
}

/**
 * Client-side only mock reference — this is a placeholder until booking
 * creation is handled by a real backend that issues authoritative IDs.
 */
export function generateBookingReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 5; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `PP-${suffix}`
}
