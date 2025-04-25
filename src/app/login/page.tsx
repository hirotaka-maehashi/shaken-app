'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fromEmail, setFromEmail] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setFromEmail(params.get('from') === 'email')
    }
  }, [])

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
      {fromEmail && (
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
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="パスワードを入力"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles.eyeButton}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>ログイン</button>
      </form>
    </div>
  )
}
