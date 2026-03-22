import { describe, it, expect } from 'vitest'
import { stripPhone, formatPhone, isValidPhone } from '@/lib/utils/phone'

describe('stripPhone', () => {
  it('should remove non-digit characters from formatted phone', () => {
    expect(stripPhone('(11) 98765-4321')).toBe('11987654321')
  })

  it('should handle phone with various separators', () => {
    expect(stripPhone('11.98765.4321')).toBe('11987654321')
    expect(stripPhone('11-98765-4321')).toBe('11987654321')
  })

  it('should handle phone with letters', () => {
    expect(stripPhone('(11) 9876-ABCD')).toBe('119876')
  })

  it('should return empty string for non-numeric input', () => {
    expect(stripPhone('ABC')).toBe('')
  })
})

describe('formatPhone', () => {
  it('should format 11-digit mobile phone', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('should format 10-digit landline', () => {
    expect(formatPhone('1123456789')).toBe('(11) 2345-6789')
  })

  it('should handle formatted input (idempotent)', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
  })

  it('should return original for invalid length', () => {
    expect(formatPhone('123')).toBe('123')
  })

  it('should return original for empty string', () => {
    expect(formatPhone('')).toBe('')
  })
})

describe('isValidPhone', () => {
  it('should validate 11-digit phone', () => {
    expect(isValidPhone('11987654321')).toBe(true)
    expect(isValidPhone('(11) 98765-4321')).toBe(true)
  })

  it('should validate 10-digit phone', () => {
    expect(isValidPhone('1123456789')).toBe(true)
    expect(isValidPhone('(11) 2345-6789')).toBe(true)
  })

  it('should reject phone with less than 10 digits', () => {
    expect(isValidPhone('123456789')).toBe(false)
  })

  it('should reject phone with more than 11 digits', () => {
    expect(isValidPhone('123456789012')).toBe(false)
  })

  it('should reject empty string', () => {
    expect(isValidPhone('')).toBe(false)
  })

  it('should reject non-numeric strings', () => {
    expect(isValidPhone('abcdefghij')).toBe(false)
  })
})
