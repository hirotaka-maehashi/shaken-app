'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'

export default function PostSignupPage() {
  const [status, setStatus] = useState('会社情報を登録中...')
  const router = useRouter()

  useEffect(() => {
    const saveCompanyName = async () => {
      try {
        const companyName = localStorage.getItem('company_name')
    
        if (!companyName) {
          throw new Error('会社名が localStorage に存在しません')
        }
    
        // セッション取得をリトライ
        let retries = 5
        let sessionData = null
    
        while (!sessionData && retries > 0) {
          const { data } = await supabase.auth.getSession()
          sessionData = data.session
    
          if (!sessionData) {
            console.log('🔄 セッション取得リトライ...')
            await new Promise(resolve => setTimeout(resolve, 500)) // 0.5秒待つ
            retries--
          }
        }
    
        if (!sessionData) {
          throw new Error('セッションが取得できません（リトライ後も失敗）')
        }
    
        console.log('✅ セッション取得成功:', sessionData)
    
        // ここから会社情報保存
        const { error: updateError } = await supabase.auth.updateUser({
          data: { company_name: companyName },
        })
    
        if (updateError) {
          throw updateError
        }
    
        localStorage.removeItem('company_name')
        console.log('🧹 company_name を localStorage から削除しました')
    
        setStatus('会社情報を保存しました。ようこそ！')
    
        setTimeout(() => {
          router.push('/login')
        }, 2000)
    
      } catch (err) {
        console.error('❌ エラー発生:', err)
        setStatus('セッションが切れているか、会社情報の保存に失敗しました。再度ログインしてください。')
        router.push('/login')
      }
    }    

    saveCompanyName()
  }, [])

  return (
    <main style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem' }}>
      <p>{status}</p>
    </main>
  )
}
