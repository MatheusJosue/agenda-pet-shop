import React, { useId } from 'react'
import cn from 'classnames'
import styles from './input.module.css'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: boolean
  errorMessage?: string
  variant?: 'default' | 'filled' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  lightMode?: boolean
}

export function Input({
  label,
  error = false,
  errorMessage,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  lightMode = false,
  className,
  id,
  required,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={cn(styles.wrapper, lightMode && 'light-input', className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={cn(
        styles.inputWrapper,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        error && styles.error,
        lightMode && styles.lightMode
      )}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

        <input
          id={inputId}
          className={cn(
            styles.input,
            leftIcon ? styles.hasLeftIcon : undefined,
            rightIcon ? styles.hasRightIcon : undefined
          )}
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
