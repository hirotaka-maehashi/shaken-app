'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import Link from 'next/link'

export default function NewCompanyPage() {
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const parentCompanyId = userData?.user?.user_metadata?.company_id

    if (!parentCompanyId) {
      alert('親会社情報が取得できません。ログインし直してください。')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('companies').insert([
      {
        name: companyName,
        parent_company_id: parentCompanyId,
      }
    ])

    if (error) {
      console.error('子会社登録エラー:', error.message)
      alert('子会社の登録に失敗しました。')
    } else {
      alert('子会社を登録しました！')
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>子会社を登録する</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label}>子会社名</label>
          <input
            type="text"
            className={styles.input}
            placeholder="例：株式会社サンプル支店"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? '登録中...' : '登録する'}
        </button>
      </form>

      <form onSubmit={handleSubmit} className={styles.form}>
  {/* 子会社名入力フォーム */}
</form>

{/* ここに戻るボタン追加 */}
<div className={styles.buttonWrapper}>
  <Link href="/dashboard">
    <button type="button" className={styles.secondaryButton}>
      ← ダッシュボードに戻る
    </button>
  </Link>
</div>

    </div>
  )
}
