export type UserRole = 'client' | 'moderator' | 'admin' | 'super_admin'
export type UserStatus = 'active' | 'suspended' | 'banned'

export type AdStatus =
  | 'draft' | 'submitted' | 'under_review'
  | 'payment_pending' | 'payment_submitted'
  | 'payment_verified' | 'scheduled' | 'published'
  | 'expired' | 'rejected' | 'archived'

export type PaymentStatus = 'pending' | 'verified' | 'rejected'
export type MediaSourceType = 'image' | 'youtube' | 'cloudinary'
export type ValidationStatus = 'pending' | 'valid' | 'invalid'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
}

export interface Ad {
  id: string
  user_id: string
  package_id: string
  category_id: string
  city_id: string
  title: string
  slug: string
  description: string
  price: number
  status: AdStatus
  rank_score: number
  publish_at: string
  expire_at: string
  created_at: string
}

export interface Package {
  id: string
  name: string
  duration_days: number
  weight: number
  is_featured: boolean
  homepage_visibility: boolean
  price: number
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}