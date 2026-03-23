/**
 * Generate a WhatsApp link with a pre-filled message
 * @param phone - Phone number (digits only, e.g., "11987654321")
 * @param message - Message to send
 * @returns WhatsApp URL (opens in new tab)
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '') // Remove non-digits
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`
}

/**
 * Generate WhatsApp message for exhausted package notification
 */
export function generateExhaustedPackageMessage(
  clientName: string,
  petName: string,
  packageName: string
): string {
  return `Olá ${clientName}! O pacote ${packageName} do(a) ${petName} acabou. Que tal renovar para continuar aproveitando?`
}
