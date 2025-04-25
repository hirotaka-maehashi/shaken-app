'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'

export default function PostSignupPage() {
  const [status, setStatus] = useState('会社情報を登録中...')
  const router = useRouter()

  useEffect(() => {
    const saveCompanyName = async () => {
      const companyName = localStorage.getItem('company_name')

      if (process.env.NODE_ENV === 'development') {
        console.log('📦 company_name from localStorage:', companyName)
      }

      if (!companyName) {
        setStatus('会社名が見つかりませんでした。')
        if (process.env.NODE_ENV === 'development') {
          console.warn('❗ 会社名が localStorage に存在しません')
        }
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (process.env.NODE_ENV === 'development') {
        console.log('🧾 sessionData:', sessionData)
        console.log('❓ sessionError:', sessionError)
      }

      if (sessionError || !sessionData?.session) {
        setStatus('認証セッションが見つかりません。')
        if (process.env.NODE_ENV === 'development') {
          console.warn('❗ セッションが取得できませんでした')
        }
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { company_name: companyName },
      })

      if (updateError) {
        setStatus('会社情報の保存に失敗しました。')
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ updateUser エラー:', updateError)
        }
        return
      }

      localStorage.removeItem('company_name')
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 company_name を localStorage から削除しました')
      }

      setStatus('会社情報を保存しました。ようこそ！')

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }

    saveCompanyName()
  }, [])

  return (
    <main style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem' }}>
      <p>{status}</p>
    </main>
  )
}
