import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get company_id
    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Get pet with company check
    const { data: pet, error } = await supabase
      .from('pets')
      .select(`
        *,
        client:clients!inner(id, name, phone)
      `)
      .eq('id', id)
      .eq('company_id', userData.company_id)
      .single()

    if (error || !pet) {
      return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ data: pet })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar pet' }, { status: 500 })
  }
}
