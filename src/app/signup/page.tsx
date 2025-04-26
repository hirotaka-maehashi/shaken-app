'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedCompanyName = companyName.trim()

    if (!trimmedCompanyName) {
      setError('法人名を入力してください。')
      console.warn('⚠️ companyName が空のままです。保存されません。')
      return
    }

    // 一時的に localStorage に会社名を保存
    localStorage.setItem('company_name', trimmedCompanyName)
    console.log('✅ company_name を localStorage に保存しました:', trimmedCompanyName)

    const emailRedirectTo = process.env.NEXT_PUBLIC_REDIRECT_URL || 'http://localhost:3000/postsignup'

    // サインアップ処理（仮登録）
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    })

    if (signUpError) {
      console.error('❌ signUpエラー詳細:', signUpError)
      setError('ユーザー登録に失敗しました：' + signUpError.message)
      return
    }

    setSuccess(
      '確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。\n' +
      '※メールが届かない場合は、迷惑メールフォルダやプロモーションタブもご確認ください。'
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>新規登録</h1>
      <form onSubmit={handleSignup} className={styles.form}>
        
        <div className={styles.group}>
          <label className={styles.label}>親会社名</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={styles.input}
            placeholder="例：〇〇グループ or 株式会社〇〇"
            required
          />
          <small className={styles.note}>
            ※ 複数社で利用する場合：グループ全体を代表する会社名を入力してください。<br />
            ※ 1社のみで利用する場合：その会社名をそのままご入力ください。
          </small>
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
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
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
