import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '@/lib/validation/auth'

describe('Auth Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid',
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject password less than 6 characters', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345'
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({
        password: 'password123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should validate correct register data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        inviteCode: 'ABC123'
      })
      expect(result.success).toBe(true)
    })

    it('should reject name less than 3 characters', () => {
      const result = registerSchema.safeParse({
        name: 'Jo',
        email: 'test@example.com',
        password: 'password123',
        inviteCode: 'ABC123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'invalid',
        password: 'password123',
        inviteCode: 'ABC123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject password less than 6 characters', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        password: '12345',
        inviteCode: 'ABC123'
      })
      expect(result.success).toBe(false)
    })

    it('should reject invite code not equal to 6 characters', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        inviteCode: 'ABC12'
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing name', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        inviteCode: 'ABC123'
      })
      expect(result.success).toBe(false)
    })
  })
})
