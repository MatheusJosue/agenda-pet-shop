/**
 * Strip non-digit characters from phone
 * "(11) 98765-4321" → "11987654321"
 */
export function stripPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Format phone digits to Brazilian mask
 * "11987654321" → "(11) 98765-4321"
 */
export function formatPhone(digits: string): string {
  const cleaned = stripPhone(digits)

  if (cleaned.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  } else if (cleaned.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }

  return digits // Return original if format doesn't match
}

/**
 * Validate phone has 10-11 digits
 */
export function isValidPhone(phone: string): boolean {
  const digits = stripPhone(phone)
  return /^\d{10,11}$/.test(digits)
}
