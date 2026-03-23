'use client'

import React, { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import cn from 'classnames'
import styles from './select.module.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'value' | 'label'> {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
  label?: React.ReactNode
  required?: boolean
  id?: string
}

export function Select({
  options,
  value = '',
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  error = false,
  className,
  label,
  required,
  id: externalId,
  ...restProps
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const internalId = useId()
  const selectId = externalId || internalId
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      const newState = !isOpen
      setIsOpen(newState)
      if (newState) {
        // Small delay to ensure the state update is processed
        setTimeout(updateDropdownPosition, 0)
      }
    }
  }

  // Track if clicking on an option to prevent premature closure
  const [isOptionClicked, setIsOptionClicked] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if we just clicked an option (let the click handler do it)
      if (isOptionClicked) {
        setIsOptionClicked(false)
        return
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, isOptionClicked])

  // Update position on scroll
  useEffect(() => {
    if (!isOpen) return

    const handleScroll = () => {
      setIsOpen(false)
    }

    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Handle option selection
  const handleOptionClick = (optionValue: string) => {
    console.log('Option clicked:', optionValue)
    onChange(optionValue)
    setIsOpen(false)
  }

  // Render option button
  const renderOption = (option: SelectOption) => {
    const isSelected = option.value === value

    return (
      <button
        key={option.value}
        type="button"
        disabled={option.disabled}
        onMouseDown={() => setIsOptionClicked(true)}
        onClick={() => handleOptionClick(option.value)}
        className={cn(
          styles.option,
          isSelected && styles.selected,
          option.disabled && styles.disabled
        )}
      >
        <span className={styles.optionLabel}>{option.label}</span>
        {isSelected && <span className={styles.checkIcon}>✓</span>}
      </button>
    )
  }

  // Dropdown content rendered via portal
  const dropdown = isOpen && !disabled && typeof window !== 'undefined' ? (
    createPortal(
      <div className={styles.portalDropdown} style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, width: `${dropdownPosition.width}px` }}>
        <div className={styles.dropdown} role="listbox">
          <div className={styles.optionsList}>
            {options.length > 0 ? (
              options.map(renderOption)
            ) : (
              <div className={styles.empty}>Nenhuma opção disponível</div>
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null

  return (
    <div
      className={cn(styles.container, className)}
      ref={containerRef}
      {...restProps}
    >
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={cn(
          styles.trigger,
          error && styles.error,
          disabled && styles.disabled,
          isOpen && styles.open
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <span className={cn(styles.value, !selectedOption && styles.placeholder)}>
          {selectedOption?.label || placeholder}
        </span>
        <span className={cn(styles.arrow, isOpen && styles.arrowOpen)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown rendered via Portal */}
      {dropdown}
    </div>
  )
}
