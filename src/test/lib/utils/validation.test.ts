import { describe, it, expect } from 'vitest'
import { isValidUUID } from '@/lib/utils/validation'

describe('isValidUUID', () => {
  it('should validate valid UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('should validate valid UUID with uppercase', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('should validate valid UUID with mixed case', () => {
    expect(isValidUUID('550e8400-E29b-41d4-A716-446655440000')).toBe(true)
  })

  it('should reject invalid format - missing dashes', () => {
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false)
  })

  it('should reject invalid format - random string', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
  })

  it('should reject empty string', () => {
    expect(isValidUUID('')).toBe(false)
  })

  it('should reject partial UUID', () => {
    expect(isValidUUID('550e8400-e29b')).toBe(false)
  })

  it('should reject UUID with invalid characters', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false)
  })
})
