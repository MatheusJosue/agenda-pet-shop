import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  checkClientAppointments,
  deleteClient
} from '@/lib/actions/clients'

vi.mock('@/lib/supabase/server')

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Clients Server Actions', () => {
  let fromMock: any

  const createMockChain = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    gte: vi.fn().mockReturnThis()
  })

  const mockSupabase = {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createSupabaseClient).mockResolvedValue(mockSupabase as any)

    // Setup from mock to return different chains based on table
    mockSupabase.from.mockImplementation((table: string) => {
      fromMock = createMockChain()
      return fromMock
    })
  })

  describe('getClients', () => {
    it('should return empty array if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await getClients()

      expect(result).toEqual({ data: [], error: undefined })
    })

    it('should return company-scoped clients', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }
      const mockClients = [
        { id: 'client-1', name: 'João Silva', phone: '11987654321' }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      // Mock the users table query (for getCurrentCompanyId)
      let callCount = 0
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.order.mockResolvedValue({ data: mockClients, error: null })
        }
        return chain
      })

      const result = await getClients()

      expect(result.data).toEqual(mockClients)
    })

    it('should filter by search term', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      let orCalledWith: any
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.or = vi.fn().mockImplementation((...args) => {
            orCalledWith = args[0]
            return chain
          })
          chain.order.mockResolvedValue({ data: [], error: null })
        }
        return chain
      })

      await getClients('João')

      expect(orCalledWith).toBe('name.ilike.%João%,phone.ilike.%João%,email.ilike.%João%')
    })

    it('should handle database errors gracefully', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.order.mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        }
        return chain
      })

      const result = await getClients()

      expect(result.data).toEqual([])
      expect(result.error).toBe('Erro ao buscar clientes')
    })

    it('should not search with empty search term', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      let orCalled = false
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.or = vi.fn().mockImplementation(() => {
            orCalled = true
            return chain
          })
          chain.order.mockResolvedValue({ data: [], error: null })
        }
        return chain
      })

      await getClients('   ')

      expect(orCalled).toBe(false)
    })
  })

  describe('getClientById', () => {
    it('should return error if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await getClientById('client-123')

      expect(result).toEqual({ data: undefined, error: 'Não autenticado' })
    })

    it('should return client from same company', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }
      const mockClient = {
        id: 'client-1',
        company_id: 'company-123',
        name: 'João Silva',
        phone: '11987654321'
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({ data: mockClient, error: null })
        }
        return chain
      })

      const result = await getClientById('client-1')

      expect(result.data).toEqual(mockClient)
    })

    it('should return error for client from different company', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({
            data: null,
            error: { message: 'Not found' }
          })
        }
        return chain
      })

      const result = await getClientById('client-from-other-company')

      expect(result.error).toBe('Cliente não encontrado')
    })

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        }
        return chain
      })

      const result = await getClientById('client-123')

      expect(result.error).toBe('Cliente não encontrado')
    })
  })

  describe('createClient', () => {
    it('should return error if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await createClient({
        name: 'João Silva',
        phone: '11987654321',
        email: 'joao@email.com'
      })

      expect(result.error).toBe('Não autenticado')
    })

    it('should create client with stripped phone', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }
      const mockClient = {
        id: 'client-1',
        name: 'João Silva',
        phone: '11987654321'
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({ data: mockClient, error: null })
        }
        return chain
      })

      const result = await createClient({
        name: 'João Silva',
        phone: '(11) 98765-4321',
        email: 'joao@email.com'
      })

      expect(result.data?.phone).toBe('11987654321')
    })

    it('should validate input with clientSchema', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        }
        return chain
      })

      const result = await createClient({
        name: 'Jo', // Too short
        phone: '11987654321',
        email: 'joao@email.com'
      })

      expect(result.error).toBe('Dados inválidos')
    })

    it('should handle database errors on create', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({
            data: null,
            error: { message: 'Insert failed' }
          })
        }
        return chain
      })

      const result = await createClient({
        name: 'João Silva',
        phone: '11987654321',
        email: 'joao@email.com'
      })

      expect(result.error).toBe('Erro ao criar cliente')
    })

    it('should create client without optional fields', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }
      const mockClient = {
        id: 'client-1',
        name: 'João Silva',
        phone: '11987654321'
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({ data: mockClient, error: null })
        }
        return chain
      })

      const result = await createClient({
        name: 'João Silva',
        phone: '11987654321'
      })

      expect(result.data).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('updateClient', () => {
    it('should return error if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await updateClient('client-123', {
        name: 'João Silva',
        phone: '11987654321'
      })

      expect(result.error).toBe('Não autenticado')
    })

    it('should update client with stripped phone', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }
      const mockClient = {
        id: 'client-1',
        name: 'João Silva Updated',
        phone: '11987654321'
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({ data: mockClient, error: null })
        }
        return chain
      })

      const result = await updateClient('client-1', {
        name: 'João Silva Updated',
        phone: '(11) 98765-4321',
        email: 'joao@email.com'
      })

      expect(result.data?.phone).toBe('11987654321')
      expect(result.data?.name).toBe('João Silva Updated')
    })

    it('should validate input with clientSchema', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        }
        return chain
      })

      const result = await updateClient('client-1', {
        name: 'Jo', // Too short
        phone: '11987654321'
      })

      expect(result.error).toBe('Dados inválidos')
    })

    it('should return error if client not found', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({
            data: null,
            error: { message: 'Not found' }
          })
        }
        return chain
      })

      const result = await updateClient('non-existent-client', {
        name: 'João Silva',
        phone: '11987654321'
      })

      expect(result.error).toBe('Erro ao atualizar cliente')
    })

    it('should handle database errors on update', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'clients') {
          chain.single.mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        }
        return chain
      })

      const result = await updateClient('client-1', {
        name: 'João Silva',
        phone: '11987654321'
      })

      expect(result.error).toBe('Erro ao atualizar cliente')
    })
  })

  describe('checkClientAppointments', () => {
    it('should return count of future appointments', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'appointments') {
          chain.gte.mockResolvedValue({
            data: [{ id: 'apt-1' }, { id: 'apt-2' }, { id: 'apt-3' }],
            error: null
          })
        }
        return chain
      })

      const count = await checkClientAppointments('client-123')

      expect(count).toBe(3)
    })

    it('should return 0 on database error', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'appointments') {
          chain.gte.mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        }
        return chain
      })

      const count = await checkClientAppointments('client-123')

      expect(count).toBe(0)
    })

    it('should return 0 when no appointments found', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'appointments') {
          chain.gte.mockResolvedValue({
            data: [],
            error: null
          })
        }
        return chain
      })

      const count = await checkClientAppointments('client-123')

      expect(count).toBe(0)
    })
  })

  describe('deleteClient', () => {
    it('should return error if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await deleteClient('client-123')

      expect(result.error).toBe('Não autenticado')
    })

    it('should prevent deletion with future appointments', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'appointments') {
          chain.gte.mockResolvedValue({
            data: [{ id: 'apt-1' }, { id: 'apt-2' }],
            error: null
          })
        }
        return chain
      })

      const result = await deleteClient('client-123')

      expect(result.error).toContain('agendamento(s) futuro(s)')
    })

    it('should delete client with no future appointments', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'appointments') {
          chain.gte.mockResolvedValue({
            data: [],
            error: null
          })
        } else if (table === 'clients') {
          // For delete, we need to mock the chain properly
          // The delete() call needs to return the chain
          const deleteChain = {
            eq: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockResolvedValue({ error: null })
            }))
          }
          chain.delete.mockReturnValue(deleteChain as any)
        }
        return chain
      })

      const result = await deleteClient('client-123')

      expect(result.error).toBeUndefined()
    })

    it('should handle database errors on delete', async () => {
      const mockUser = { id: 'user-123' }
      const mockUserData = { company_id: 'company-123' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = createMockChain()
        if (table === 'users') {
          chain.single.mockResolvedValue({ data: mockUserData, error: null })
        } else if (table === 'appointments') {
          chain.gte.mockResolvedValue({
            data: [],
            error: null
          })
        } else if (table === 'clients') {
          // For delete, we need to mock the chain properly
          // The delete() call needs to return the chain
          const deleteChain = {
            eq: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
            }))
          }
          chain.delete.mockReturnValue(deleteChain as any)
        }
        return chain
      })

      const result = await deleteClient('client-123')

      expect(result.error).toBe('Erro ao excluir cliente')
    })
  })
})
