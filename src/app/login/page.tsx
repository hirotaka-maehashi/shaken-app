'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
    } else {
      // ✅ ログイン成功後に trial_start を一度だけ登録（初回ログイン時）
      const { data: userData } = await supabase.auth.getUser()
      const metadata = userData.user?.user_metadata || {}

      if (!metadata.trial_start) {
        const today = new Date().toISOString()

        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            trial_start: today,
            plan: 'trial_light',
          },
        })

        if (updateError) {
          console.error('ユーザー情報の更新に失敗しました：', updateError.message)
        }
      }

      router.push('/dashboard')
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>ログイン</h1>
      {from === 'email' && (
        <p className={styles.notice}>✅ メール認証が完了しました。ログインしてください。</p>
      )}
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label}>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="you@example.com"
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
            placeholder="パスワードを入力"
            required
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>ログイン</button>
      </form>
    </div>
  )
}
