import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login, register, logout } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Mock Supabase clients
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn()
      }
    },
    from: vi.fn()
  }
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn()
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Auth Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
          })
        }
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      const result = await login(formData)

      expect(result.success).toBe(true)
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should fail with invalid email format', async () => {
      const formData = new FormData()
      formData.append('email', 'invalid-email')
      formData.append('password', 'password123')

      const result = await login(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email inválido')
    })

    it('should fail with short password', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '12345')

      const result = await login(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Senha deve ter no mínimo 6 caracteres')
    })

    it('should fail with invalid credentials', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid login credentials' }
          })
        }
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword')

      const result = await login(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Credenciais inválidas')
    })

    it('should fail with missing email', async () => {
      const formData = new FormData()
      formData.append('password', 'password123')

      const result = await login(formData)

      expect(result.success).toBe(false)
    })

    it('should fail with missing password', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')

      const result = await login(formData)

      expect(result.success).toBe(false)
    })
  })

  describe('register', () => {
    it('should register successfully with valid data and invite code', async () => {
      const mockInviteQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'invite-123',
            company_id: 'company-123',
            role: 'company_admin',
            accepted_at: null,
            expires_at: new Date(Date.now() + 86400000).toISOString()
          },
          error: null
        })
      }

      const mockUsersInsert = {
        insert: vi.fn().mockResolvedValue({ error: null })
      }

      const mockInvitesUpdate = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }

      let callCount = 0
      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'invites' && callCount === 0) {
          callCount++
          return mockInviteQuery as any
        }
        if (table === 'users') {
          return mockUsersInsert as any
        }
        if (table === 'invites') {
          return mockInvitesUpdate as any
        }
        return {} as any
      })

      vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      } as any)

      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(true)
      expect(mockInviteQuery.single).toHaveBeenCalled()
    })

    it('should fail with invalid email format', async () => {
      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'invalid-email')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email inválido')
    })

    it('should fail with short name', async () => {
      const formData = new FormData()
      formData.append('name', 'Jo')
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Nome deve ter no mínimo 3 caracteres')
    })

    it('should fail with short password', async () => {
      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'test@example.com')
      formData.append('password', '12345')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Senha deve ter no mínimo 6 caracteres')
    })

    it('should fail with invalid invite code length', async () => {
      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC12')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Código deve ter 6 caracteres')
    })

    it('should fail when invite code not found', async () => {
      const mockInviteQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      }

      vi.mocked(supabaseAdmin.from).mockReturnValue(mockInviteQuery as any)

      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Código de convite inválido ou expirado')
    })

    it('should fail when invite already accepted (atomic check)', async () => {
      const mockInviteQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null, // Atomic query returns null if accepted_at is not null
          error: { message: 'Not found' }
        })
      }

      vi.mocked(supabaseAdmin.from).mockReturnValue(mockInviteQuery as any)

      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Código de convite inválido ou expirado')
    })

    it('should fail when invite expired (atomic check)', async () => {
      const mockInviteQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null, // Atomic query returns null if expired
          error: { message: 'Not found' }
        })
      }

      vi.mocked(supabaseAdmin.from).mockReturnValue(mockInviteQuery as any)

      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Código de convite inválido ou expirado')
    })

    it('should handle auth creation errors', async () => {
      const mockInviteQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'invite-123',
            company_id: 'company-123',
            role: 'company_user',
            accepted_at: null,
            expires_at: new Date(Date.now() + 86400000).toISOString()
          },
          error: null
        })
      }

      vi.mocked(supabaseAdmin.from).mockReturnValue(mockInviteQuery as any)
      vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
        data: null,
        error: { message: 'User already exists' }
      } as any)

      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'existing@example.com')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro ao criar usuário')
    })

    it('should cleanup auth user when user record creation fails', async () => {
      const mockInviteQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'invite-123',
            company_id: 'company-123',
            role: 'company_user',
            accepted_at: null,
            expires_at: new Date(Date.now() + 86400000).toISOString()
          },
          error: null
        })
      }

      const mockUsersInsert = {
        insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } })
      }

      let callCount = 0
      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'invites' && callCount === 0) {
          callCount++
          return mockInviteQuery as any
        }
        if (table === 'users') {
          return mockUsersInsert as any
        }
        return {} as any
      })

      vi.mocked(supabaseAdmin.auth.admin.createUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      } as any)

      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('inviteCode', 'ABC123')

      const result = await register(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro ao criar usuário')
      expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('user-123')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({ error: null })
        }
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await logout()

      expect(result.success).toBe(true)
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle logout errors gracefully', async () => {
      const mockSupabase = {
        auth: {
          signOut: vi.fn().mockResolvedValue({
            error: { message: 'Logout failed' }
          })
        }
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await logout()

      expect(result.success).toBe(false)
    })
  })
})
