import React, { useId } from 'react'
import cn from 'classnames'
import styles from './input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
  errorMessage?: string
  variant?: 'default' | 'filled' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Input({
  label,
  error = false,
  errorMessage,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  id,
  required,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={cn(styles.wrapper, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={cn(styles.inputWrapper, styles[`variant-${variant}`], styles[`size-${size}`], error && styles.error)}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

        <input
          id={inputId}
          className={cn(styles.input, leftIcon && styles.hasLeftIcon, rightIcon && styles.hasRightIcon)}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
          required={required}
          {...props}
        />

        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>

      {error && errorMessage && (
        <span id={`${inputId}-error`} className={styles.errorMessage}>
          {errorMessage}
        </span>
      )}
    </div>
  )
}
