import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    const now = new Date().toISOString()

    const { data: ads } = await supabaseAdmin
      .from('ads')
      .select('id, title, user_id')
      .eq('status', 'scheduled')
      .lte('publish_at', now)

    if (!ads || ads.length === 0) {
      return NextResponse.json({ message: 'No ads to publish', count: 0 })
    }

    for (const ad of ads) {
      await supabaseAdmin
        .from('ads')
        .update({ status: 'published' })
        .eq('id', ad.id)

      await supabaseAdmin.from('ad_status_history').insert({
        ad_id: ad.id,
        previous_status: 'scheduled',
        new_status: 'published',
        note: 'Auto-published by cron job',
      })

      await supabaseAdmin.from('notifications').insert({
        user_id: ad.user_id,
        title: 'Ad is Now Live!',
        message: `Your ad "${ad.title}" has been published.`,
        type: 'success',
      })
    }

    await supabaseAdmin.from('system_health_logs').insert({
      source: 'cron/publish-scheduled',
      status: 'ok',
      note: `Published ${ads.length} ads`,
    })

    return NextResponse.json({ message: 'Cron ran successfully', count: ads.length })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}