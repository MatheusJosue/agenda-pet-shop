import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import styles from './toast.module.css'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'
export type ToastPosition = 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'

export interface ToastProps {
  message: string
  variant?: ToastVariant
  duration?: number
  onClose?: () => void
  onDismiss?: () => void
  closeButton?: boolean
  showIcon?: boolean
  position?: ToastPosition
}

export function Toast({
  message,
  variant = 'info',
  duration = 5000,
  onClose,
  onDismiss,
  closeButton = false,
  showIcon = true,
  position = 'top-right',
}: ToastProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleDismiss()
      }, duration)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [duration])

  const handleDismiss = () => {
    if (onClose) onClose()
    if (onDismiss) onDismiss()
  }

  if (!message) {
    return null
  }

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  return (
    <div
      className={cn(
        styles.toast,
        styles[`variant-${variant}`],
        styles[`position-${position}`]
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.content}>
        {showIcon && (
          <span data-testid="toast-icon" className={styles.icon}>
            {getIcon()}
          </span>
        )}
        <span className={styles.message}>{message}</span>
        {closeButton && (
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleDismiss}
            aria-label="Close notification"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
