'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'

export default function SignupPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
  
    const today = new Date().toISOString()
  
    // ✅ Step 1: ユーザー登録
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })
  
    if (signUpError || !signUpData.user) {
      setError('ユーザー登録に失敗しました：' + signUpError?.message)
      return
    }
  
    // ✅ Step 1.5: 明示的にログイン（トークン確定）
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
  
    if (signInError) {
      setError('自動ログインに失敗しました：' + signInError.message)
      return
    }
  
    // ✅ Step 2: 認証済セッションで companies に INSERT
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([{ name: companyName }])
      .select()
      .single()
  
    if (companyError || !companyData) {
      setError('法人登録に失敗しました：' + companyError?.message)
      return
    }
  
    const companyId = companyData.id
  
    // ✅ Step 3: user_metadata に company_id を反映
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        company_id: companyId,
        company_name: companyName,
        plan: 'trial_light',
        trial_start: today
      }
    })
  
    if (updateError) {
      setError('ユーザー情報の更新に失敗しました：' + updateError.message)
      return
    }
  
    setSuccess('登録が完了しました。ログイン画面に移動します...')
    setTimeout(() => router.push('/login'), 1500)
  }  

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>新規登録</h1>
      <form onSubmit={handleSignup} className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label}>法人名（会社名）</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={styles.input}
            placeholder="例：株式会社AIモータース"
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button type="submit" className={styles.button}>登録する</button>
      </form>
    </div>
  )
}