import React from 'react'
import cn from 'classnames'
import styles from './glass-card.module.css'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  gradientBorder?: boolean
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  size = 'md',
  clickable = false,
  gradientBorder = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        styles['glass-card'],
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        clickable && styles.clickable,
        gradientBorder && styles['gradient-border'],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
