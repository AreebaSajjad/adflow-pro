import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return NextResponse.json({ categories })
}