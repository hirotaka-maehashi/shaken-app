'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'

export default function SignupPage() {
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // ✅ Step 1: ユーザー登録（リダイレクトURLを明示）
    const emailRedirectTo = process.env.NEXT_PUBLIC_REDIRECT_URL || 'http://localhost:3000/login'

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    })    

    if (signUpError || !signUpData.user) {
      setError('ユーザー登録に失敗しました：' + signUpError?.message)
      return
    }

    setSuccess(
      '確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。\n' +
      '※メールが届かない場合は、迷惑メールフォルダやプロモーションタブもご確認ください。'
    )

    // ✅ 法人情報はログイン後に登録するように変更（セッションがまだ無効なため）
    // ここでは処理終了。次のログイン画面で再度会社情報の反映を行う流れでもOK
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
        {success && (
          <p className={styles.success}>
            {success.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
        )}

        <button type="submit" className={styles.button}>登録する</button>
      </form>
    </div>
  )
}