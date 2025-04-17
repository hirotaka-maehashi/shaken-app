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

    // Step 1: 会社を登録（companiesテーブルにINSERT）
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([{ name: companyName }])
      .select()
      .single()

    if (companyError) {
      setError('法人登録に失敗しました：' + companyError.message)
      return
    }

    const companyId = companyData.id

    // Step 2: ユーザーをAuthに登録し、company_idを含める
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_id: companyId,
          company_name: companyName,
          plan: 'trial_light',
          trial_start: today
        }
      }
    })

    if (signupError) {
      setError('ユーザー登録に失敗しました：' + signupError.message)
    } else {
      setSuccess('登録が完了しました。ログイン画面に移動します...')
      setTimeout(() => router.push('/login'), 1500)
    }
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