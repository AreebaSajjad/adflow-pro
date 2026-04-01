import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: cities } = await supabaseAdmin
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return NextResponse.json({ cities })
}