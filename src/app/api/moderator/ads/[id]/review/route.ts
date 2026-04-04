import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/jwt'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || !['moderator', 'admin', 'super_admin'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { action, note } = await req.json()
  const newStatus = action === 'approve' ? 'payment_pending' : 'rejected'

  const { data: ad } = await supabaseAdmin
    .from('ads')
    .select('status, user_id, title')
    .eq('id', id)
    .single()

  if (!ad) {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
  }

  await supabaseAdmin
    .from('ads')
    .update({ status: newStatus })
    .eq('id', id)

  await supabaseAdmin.from('ad_status_history').insert({
    ad_id: id,
    previous_status: ad.status,
    new_status: newStatus,
    changed_by: payload.userId,
    note: note || `${action}d by moderator`,
  })

  await supabaseAdmin.from('notifications').insert({
    user_id: ad.user_id,
    title: action === 'approve' ? 'Ad Approved!' : 'Ad Rejected',
    message:
      action === 'approve'
        ? `Your ad "${ad.title}" passed review. Please submit payment.`
        : `Your ad "${ad.title}" was rejected. Reason: ${note || 'Policy violation'}`,
    type: action === 'approve' ? 'success' : 'error',
  })

  return NextResponse.json({ message: `Ad ${action}d successfully` })
}