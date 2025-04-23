'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)

      if (!error && data.session) {
        router.push('/dashboard') // ログイン成功後
      } else {
        console.error('認証エラー:', error)
        router.push('/login') // 失敗時
      }
    }

    handleCallback()
  }, [router])

  return <p>ログイン処理中です...</p>
}