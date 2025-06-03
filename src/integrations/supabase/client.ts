
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = 'https://exymthrcnygywlibclry.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eW10aHJjbnlneXdsaWJjbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNzI1MzEsImV4cCI6MjA2MzY0ODUzMX0.JWBGilnsO64KE74UT3haeUbMYjfvMh-pdUfvfNgsuCU'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
})
