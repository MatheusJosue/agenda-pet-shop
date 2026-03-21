import React from 'react'
import cn from 'classnames'
import styles from './button.module.css'
import { GlassCard } from './glass-card'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={cn(
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        loading && styles.loading,
        className
      )}
      disabled={isDisabled}
      data-loading={loading}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true">
          <span className={styles.spinnerDot}></span>
          <span className={styles.spinnerDot}></span>
          <span className={styles.spinnerDot}></span>
        </span>
      ) : null}
      <span className={styles.content}>{children}</span>
    </button>
  )
}
