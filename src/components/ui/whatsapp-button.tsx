import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface WhatsAppButtonProps {
  phone: string
  message: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  showLabel?: boolean
}

export function WhatsAppButton({
  phone,
  message,
  size = 'sm',
  variant = 'secondary',
  showLabel = true
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/55${cleanPhone}?text=${encodedMessage}`
    window.open(url, '_blank')
  }

  const sizeClasses = {
    sm: 'h-7 px-2.5 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-5 text-base'
  }

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 18
  }

  // Custom premium design for ghost variant (used in contact cards)
  if (variant === 'ghost') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative group inline-flex items-center justify-center gap-1.5
          ${sizeClasses[size]}
          rounded-lg font-medium transition-all duration-300
          overflow-hidden
        `}
        style={{
          background: isHovered
            ? 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(37, 211, 102, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(37, 211, 102, 0.04) 100%)',
          border: '1px solid rgba(37, 211, 102, 0.2)',
          boxShadow: isHovered
            ? '0 0 20px rgba(37, 211, 102, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 0 10px rgba(37, 211, 102, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Animated shimmer effect */}
        <span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
        />

        {/* Icon with glow */}
        <span className="relative flex items-center justify-center">
          <span
            className="absolute inset-0 rounded-full bg-[#25d366]/20 blur-sm animate-pulse"
            style={{ animationDuration: '2s' }}
          />
          <MessageCircle
            size={iconSizes[size]}
            className="relative z-10 transition-transform duration-300 group-hover:scale-110"
            style={{ color: '#25d366' }}
          />
        </span>

        {showLabel && (
          <span className="relative z-10 font-semibold" style={{ color: '#25d366' }}>
            WhatsApp
          </span>
        )}

        {/* Decorative corner accents */}
        <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#25d366]/30 rounded-tr-sm" />
        <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#25d366]/20 rounded-bl-sm" />
      </button>
    )
  }

  // Primary/Secondary variants with premium gradient styling
  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group inline-flex items-center justify-center gap-2
        ${sizeClasses[size]}
        rounded-xl font-semibold text-white
        transition-all duration-300
        overflow-hidden
      `}
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, #25d366 0%, #128c7e 50%, #25d366 100%)'
          : 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
        boxShadow: isHovered
          ? '0 8px 30px rgba(37, 211, 102, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
          : '0 4px 15px rgba(37, 211, 102, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)'
      }}
    >
      {/* Animated gradient overlay */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
          backgroundSize: '200% 200%'
        }}
      />

      {/* Icon container with ring */}
      <span className="relative flex items-center justify-center">
        <span
          className={`absolute rounded-full border border-white/20 transition-all duration-300 ${
            isHovered ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            width: size === 'sm' ? '20px' : size === 'md' ? '24px' : '28px',
            height: size === 'sm' ? '20px' : size === 'md' ? '24px' : '28px'
          }}
        />
        <MessageCircle
          size={iconSizes[size]}
          className="relative z-10 transition-transform duration-300 group-hover:rotate-12"
        />
      </span>

      {showLabel && (
        <span className="relative z-10 drop-shadow-sm">
          WhatsApp
        </span>
      )}

      {/* Corner shine effect */}
      <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
    </button>
  )
}

// Add custom animations to global styles
const styleElement = document.createElement('style')
styleElement.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
`
if (!document.head.querySelector('style[data-whatsapp-animations]')) {
  styleElement.setAttribute('data-whatsapp-animations', 'true')
  document.head.appendChild(styleElement)
}
