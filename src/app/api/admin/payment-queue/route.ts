import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select(`*, ads(title, status, user_id), users(name, email)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return NextResponse.json({ payments })
}