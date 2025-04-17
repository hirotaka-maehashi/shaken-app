'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl) console.error('🚨 Supabase URL is missing!')
if (!supabaseKey) console.error('🚨 Supabase ANON KEY is missing!')

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase