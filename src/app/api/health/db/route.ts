import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const start = Date.now()
  try {
    await supabaseAdmin.from('learning_questions').select('id').limit(1)
    const ms = Date.now() - start

    await supabaseAdmin.from('system_health_logs').insert({
      source: 'health/db',
      response_ms: ms,
      status: ms < 1000 ? 'ok' : 'slow',
      note: 'DB heartbeat check',
    })

    return NextResponse.json({
      status: 'ok',
      response_ms: ms,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 })
  }
}