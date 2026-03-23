import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WhatsAppButtonProps {
  phone: string
  message: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export function WhatsAppButton({
  phone,
  message,
  size = 'sm',
  variant = 'secondary'
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`
    window.open(url, '_blank')
  }

  return (
    <Button
      onClick={handleClick}
      size={size}
      variant={variant}
      className="gap-2"
    >
      <MessageCircle size={16} />
      WhatsApp
    </Button>
  )
}
