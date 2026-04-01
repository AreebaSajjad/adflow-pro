import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { signToken } from '@/lib/jwt'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
  const errorMessage =
    parsed.error.issues?.[0]?.message || 'Validation error'

  return NextResponse.json(
    { error: errorMessage },
    { status: 400 }
  )
}
    const { name, email, password } = parsed.data

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({ name, email, password_hash, role: 'client' })
      .select('id, name, email, role')
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }

    // Create seller profile
    await supabaseAdmin
      .from('seller_profiles')
      .insert({ user_id: user.id, display_name: name })

    // Generate token
    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    const response = NextResponse.json(
      { message: 'Registered successfully', user },
      { status: 201 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  }  catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 })
  }
}