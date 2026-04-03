import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    const now = new Date().toISOString()

    const { data: ads } = await supabaseAdmin
      .from('ads')
      .select('id, title, user_id')
      .eq('status', 'published')
      .lte('expire_at', now)

    if (!ads || ads.length === 0) {
      return NextResponse.json({ message: 'No ads to expire', count: 0 })
    }

    for (const ad of ads) {
      await supabaseAdmin
        .from('ads')
        .update({ status: 'expired' })
        .eq('id', ad.id)

      await supabaseAdmin.from('ad_status_history').insert({
        ad_id: ad.id,
        previous_status: 'published',
        new_status: 'expired',
        note: 'Auto-expired by cron job',
      })

      await supabaseAdmin.from('notifications').insert({
        user_id: ad.user_id,
        title: 'Ad Expired',
        message: `Your ad "${ad.title}" has expired. Renew to keep it live.`,
        type: 'warning',
      })
    }

    await supabaseAdmin.from('system_health_logs').insert({
      source: 'cron/expire-ads',
      status: 'ok',
      note: `Expired ${ads.length} ads`,
    })

    return NextResponse.json({ message: 'Expire cron ran', count: ads.length })
  } catch (err) {
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}