import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const adminSupabase = createClient(supabaseUrl, supabaseKey)

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await adminSupabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single()
    return !!data
  } catch {
    return false
  }
}
