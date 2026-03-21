import { describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/lib/supabase/client'

describe('createClient (browser)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  })

  it('should create Supabase client with correct config', () => {
    const client = createClient()

    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})
