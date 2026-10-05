'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

export type CurrentUser = { id: string; username: string; isAdmin: boolean }

async function fetchUser(): Promise<CurrentUser | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('username, is_admin').eq('id', user.id).maybeSingle()
  return { id: user.id, username: profile?.username ?? user.email?.split('@')[0] ?? 'otaku', isAdmin: profile?.is_admin === true }
}

export function useUser() {
  const { data, isLoading, mutate } = useSWR('auth-user', fetchUser)
  useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange(() => { mutate() })
    return () => subscription.unsubscribe()
  }, [mutate])
  return { user: data ?? null, isLoading, refreshUser: mutate }
}

