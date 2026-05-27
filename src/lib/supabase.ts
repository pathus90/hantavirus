import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[hantavirus-portal] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and set your Supabase credentials.',
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey ?? 'YOUR_SUPABASE_ANON_KEY',
)
