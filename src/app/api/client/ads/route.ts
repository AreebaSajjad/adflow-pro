import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/jwt'
import { z } from 'zod'

const adSchema = z.object({
  title: z.string().min(5, 'Title too short'),
  description: z.string().min(20, 'Description too short'),
  price: z.string().optional(),
  package_id: z.string().uuid('Invalid package'),
  category_id: z.string().uuid('Invalid category'),
  city_id: z.string().uuid('Invalid city'),
  media_url: z.string().url().optional().or(z.literal('')),
})

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') +
    '-' + Date.now()
}

function getMediaType(url: string): 'youtube' | 'image' {
  return url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' : 'image'
}

function getThumbnail(url: string, type: string): string {
  if (type === 'youtube') {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : url
  }
  return url
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await req.json()
    const parsed = adSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { title, description, price, package_id, category_id, city_id, media_url } = parsed.data

    const slug = generateSlug(title)

    const { data: ad, error } = await supabaseAdmin
      .from('ads')
      .insert({
        user_id: payload.userId,
        title,
        slug,
        description,
        price: price ? parseFloat(price) : null,
        package_id,
        category_id,
        city_id,
        status: 'submitted',
      })
      .select('id')
      .single()

    if (error || !ad) {
      return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
    }

    // Save media if provided
    if (media_url) {
      const source_type = getMediaType(media_url)
      const thumbnail_url = getThumbnail(media_url, source_type)
      await supabaseAdmin.from('ad_media').insert({
        ad_id: ad.id,
        source_type,
        original_url: media_url,
        thumbnail_url,
        validation_status: 'valid',
      })
    }

    // Log status history
    await supabaseAdmin.from('ad_status_history').insert({
      ad_id: ad.id,
      previous_status: 'draft',
      new_status: 'submitted',
      changed_by: payload.userId,
      note: 'Ad submitted by client',
    })

    // Notification
    await supabaseAdmin.from('notifications').insert({
      user_id: payload.userId,
      title: 'Ad Submitted',
      message: `Your ad "${title}" has been submitted for review.`,
      type: 'success',
    })

    return NextResponse.json({ message: 'Ad submitted successfully', ad_id: ad.id }, { status: 201 })

  } catch (err) {
    console.error('Ad submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { data: ads } = await supabaseAdmin
      .from('ads')
      .select(`*, packages(name, price), categories(name), cities(name)`)
      .eq('user_id', payload.userId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ ads })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}