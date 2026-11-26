import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Without both values the site runs in demo mode and keeps bouquets in the browser
export const isDemo = !url || !key

export const supabase = isDemo ? null : createClient(url, key)
