import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload || !['moderator', 'admin', 'super_admin'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: ads } = await supabaseAdmin
    .from('ads')
    .select(`*, users(name, email), categories(name), cities(name), packages(name), ad_media(original_url, thumbnail_url, source_type)`)
    .eq('status', 'submitted')
    .order('created_at', { ascending: true })

  return NextResponse.json({ ads })
}