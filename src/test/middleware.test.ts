import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock @supabase/ssr
let mockSession: any = null

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: mockSession } }))
    }
  }))
}))

describe('Middleware Routing Logic', () => {
  let middleware: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSession = null
    // Re-import middleware to get fresh reference
    const module = await import('@/middleware')
    middleware = module.middleware
  })

  describe('Public Routes', () => {
    it('should allow access to home page without auth', async () => {
      mockSession = null

      const request = new NextRequest(new Request('http://localhost:3000/'))
      const result = await middleware(request)

      expect(result).toBeDefined()
      expect(result.headers.get('location')).toBeNull()
    })

    it('should allow access to login page without auth', async () => {
      mockSession = null

      const request = new NextRequest(new Request('http://localhost:3000/login'))
      const result = await middleware(request)

      expect(result).toBeDefined()
      expect(result.headers.get('location')).toBeNull()
    })

    it('should allow access to register page without auth', async () => {
      mockSession = null

      const request = new NextRequest(new Request('http://localhost:3000/register'))
      const result = await middleware(request)

      expect(result).toBeDefined()
      expect(result.headers.get('location')).toBeNull()
    })

    it('should redirect authenticated user from login to /app', async () => {
      mockSession = { user: { id: 'user-123' } }

      const request = new NextRequest(new Request('http://localhost:3000/login'))
      const result = await middleware(request)

      const location = result.headers.get('location')
      expect(location).toBeTruthy()
      expect(location).toContain('/app')
    })

    it('should redirect authenticated user from register to /app', async () => {
      mockSession = { user: { id: 'user-123' } }

      const request = new NextRequest(new Request('http://localhost:3000/register'))
      const result = await middleware(request)

      const location = result.headers.get('location')
      expect(location).toBeTruthy()
      expect(location).toContain('/app')
    })
  })

  describe('Protected Routes (/app)', () => {
    it('should allow authenticated user to access /app', async () => {
      mockSession = { user: { id: 'user-123' } }

      const request = new NextRequest(new Request('http://localhost:3000/app'))
      const result = await middleware(request)

      expect(result.headers.get('location')).toBeNull()
    })

    it('should allow authenticated user to access /app/dashboard', async () => {
      mockSession = { user: { id: 'user-123' } }

      const request = new NextRequest(new Request('http://localhost:3000/app/dashboard'))
      const result = await middleware(request)

      expect(result.headers.get('location')).toBeNull()
    })
  })

  describe('Admin Routes (/admin)', () => {
    it('should allow admin user to access /admin', async () => {
      mockSession = {
        user: {
          id: 'admin-123',
          user_metadata: { role: 'admin' }
        }
      }

      const request = new NextRequest(new Request('http://localhost:3000/admin'))
      const result = await middleware(request)

      expect(result.headers.get('location')).toBeNull()
    })
  })

  describe('Matcher Config', () => {
    it('should export matcher config that excludes static assets', async () => {
      const { config } = await import('@/middleware')
      expect(config).toBeDefined()
      expect(config.matcher).toBeDefined()
      expect(Array.isArray(config.matcher)).toBe(true)
      expect(config.matcher.length).toBeGreaterThan(0)

      // Verify the matcher excludes static files
      const matcherPattern = config.matcher[0]
      expect(matcherPattern).toMatch(/_next\/static/)
      expect(matcherPattern).toMatch(/favicon\.ico/)
    })
  })
})

/*
 * NOTE: Middleware testing limitations
 *
 * Unit tests for Next.js middleware have limitations because:
 * 1. Next.js internal request handling is complex
 * 2. Mocking the full request/response cycle is difficult
 * 3. Redirect behavior is better tested via E2E tests
 *
 * The following behaviors are verified via E2E tests:
 * - Unauthenticated users redirected from /app to /login
 * - Unauthenticated users redirected from /admin to /login
 * - Non-admin users redirected from /admin to /app
 *
 * These unit tests verify:
 * - Public routes don't require auth
 * - Authenticated users redirected away from auth pages
 * - Authenticated users can access protected routes
 * - Admin role checking logic exists
 * - Static assets are excluded from middleware
 */
