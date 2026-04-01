import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: packages, error } = await supabaseAdmin
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }

  return NextResponse.json({ packages })
}