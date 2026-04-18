import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client (browser safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (server only — never expose to browser)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types based on your schema
export type UserRole = 'client' | 'moderator' | 'admin' | 'super_admin';
export type AdStatus = 'draft' | 'submitted' | 'under_review' | 'payment_pending' | 'payment_submitted' | 'payment_verified' | 'scheduled' | 'published' | 'expired' | 'rejected' | 'archived';

export interface Package {
  id: string;
  name: string;
  duration_days: number;
  weight: number;
  is_featured: boolean;
  homepage_visibility: boolean;
  price: number;
  refresh_days: number | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Ad {
  id: string;
  user_id: string;
  package_id: string;
  category_id: string;
  city_id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: AdStatus;
  rank_score: number;
  publish_at: string;
  expire_at: string;
  created_at: string;
  packages?: Package;
  categories?: Category;
  cities?: City;
  ad_media?: AdMedia[];
}

export interface AdMedia {
  id: string;
  ad_id: string;
  source_type: 'image' | 'youtube' | 'cloudinary';
  original_url: string;
  thumbnail_url: string;
  validation_status: 'pending' | 'valid' | 'invalid';
}

export interface LearningQuestion {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}