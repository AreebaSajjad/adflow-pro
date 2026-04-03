import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/jwt'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = verifyToken(token)
  if (!payload || !['admin', 'super_admin'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { action, note } = await req.json()
  if (!['verify', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*, ads(title, user_id, package_id)')
    .eq('id', id) // ✅ fixed
    .single()

  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  const newPaymentStatus = action === 'verify' ? 'verified' : 'rejected'
  const newAdStatus = action === 'verify' ? 'payment_verified' : 'payment_pending'

  // Update payment
  await supabaseAdmin
    .from('payments')
    .update({
      status: newPaymentStatus,
      verified_by: payload.userId,
      verified_at: new Date().toISOString(),
      note: note || null,
    })
    .eq('id', id) // ✅ fixed

  // Update ad status
  await supabaseAdmin
    .from('ads')
    .update({ status: newAdStatus })
    .eq('id', payment.ad_id)

  // If verified, auto-publish immediately
  if (action === 'verify') {
    const { data: pkg } = await supabaseAdmin
      .from('packages')
      .select('duration_days')
      .eq('id', payment.ads.package_id)
      .single()

    const expire_at = new Date()
    expire_at.setDate(expire_at.getDate() + (pkg?.duration_days || 7))

    await supabaseAdmin
      .from('ads')
      .update({
        status: 'published',
        publish_at: new Date().toISOString(),
        expire_at: expire_at.toISOString(),
        rank_score: 10,
      })
      .eq('id', payment.ad_id)

    await supabaseAdmin.from('ad_status_history').insert({
      ad_id: payment.ad_id,
      previous_status: 'payment_submitted',
      new_status: 'published',
      changed_by: payload.userId,
      note: 'Payment verified and ad published',
    })
  }

  // Notify client
  await supabaseAdmin.from('notifications').insert({
    user_id: payment.ads.user_id,
    title: action === 'verify' ? 'Payment Verified — Ad Live!' : 'Payment Rejected',
    message:
      action === 'verify'
        ? `Your ad "${payment.ads.title}" is now live!`
        : `Payment for "${payment.ads.title}" was rejected. Reason: ${note || 'Invalid transaction'}`,
    type: action === 'verify' ? 'success' : 'error',
  })

  return NextResponse.json({
    message: `Payment ${action === 'verify' ? 'verified' : 'rejected'}`
  })
}