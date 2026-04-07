import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { ad_id, amount, method, transaction_ref, sender_name, screenshot_url } = body

    if (!ad_id || !amount || !method || !transaction_ref || !sender_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check duplicate transaction ref
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_ref', transaction_ref)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Duplicate transaction reference' }, { status: 400 })
    }

    // Insert payment
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        ad_id,
        amount,
        method,
        transaction_ref,
        sender_name,
        screenshot_url: screenshot_url || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Update ad status to payment_submitted
    await supabase
      .from('ads')
      .update({ status: 'payment_submitted' })
      .eq('id', ad_id)
      .eq('user_id', user.userId)

    // Log status history
    await supabase.from('ad_status_history').insert({
      ad_id,
      previous_status: 'payment_pending',
      new_status: 'payment_submitted',
      changed_by: user.userId,
      note: 'Payment proof submitted by client'
    })

    // Notification
    await supabase.from('notifications').insert({
      user_id: user.userId,
      title: 'Payment Submitted',
      message: 'Your payment proof has been submitted. Admin will verify shortly.',
      type: 'info',
      is_read: false
    })

    return NextResponse.json({ success: true, payment })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}