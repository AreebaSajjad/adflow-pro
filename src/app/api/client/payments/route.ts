import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const paymentSchema = z.object({
  ad_id: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string().min(1),
  transaction_ref: z.string().min(3),
  sender_name: z.string().min(2),
  screenshot_url: z.string().url().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await req.json()
    const parsed = paymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { ad_id, amount, method, transaction_ref, sender_name, screenshot_url } = parsed.data

    // Check duplicate transaction ref
    const { data: existing } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('transaction_ref', transaction_ref)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Duplicate transaction reference' }, { status: 409 })
    }

    // Verify ad belongs to user
    const { data: ad } = await supabaseAdmin
      .from('ads')
      .select('id, status, title, user_id')
      .eq('id', ad_id)
      .eq('user_id', payload.userId)
      .single()

    if (!ad) return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    if (ad.status !== 'payment_pending') {
      return NextResponse.json({ error: 'Ad is not in payment pending state' }, { status: 400 })
    }

    // Insert payment
    await supabaseAdmin.from('payments').insert({
      ad_id,
      user_id: payload.userId,
      amount,
      method,
      transaction_ref,
      sender_name,
      screenshot_url: screenshot_url || null,
      status: 'pending',
    })

    // Update ad status
    await supabaseAdmin
      .from('ads')
      .update({ status: 'payment_submitted' })
      .eq('id', ad_id)

    // Log history
    await supabaseAdmin.from('ad_status_history').insert({
      ad_id,
      previous_status: 'payment_pending',
      new_status: 'payment_submitted',
      changed_by: payload.userId,
      note: 'Payment proof submitted',
    })

    // Notification
    await supabaseAdmin.from('notifications').insert({
      user_id: payload.userId,
      title: 'Payment Submitted',
      message: `Payment for "${ad.title}" submitted. Waiting for admin verification.`,
      type: 'info',
    })

    return NextResponse.json({ message: 'Payment submitted successfully' }, { status: 201 })

  } catch (err) {
    console.error('Payment error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}