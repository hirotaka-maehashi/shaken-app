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

    try {
      const { data: userData } = await supabase.auth.getUser()
      const parentCompanyId = userData?.user?.user_metadata?.company_id
      const userId = userData?.user?.id

      if (!parentCompanyId || !userId) {
        alert('親会社情報またはユーザーIDが取得できません。ログインし直してください。')
        setLoading(false)
        return
      }

      // ① 重複チェック
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id')
        .eq('name', companyName)
        .maybeSingle()

      if (checkError) {
        console.error('チェックエラー:', checkError.message)
        alert('登録時にエラーが発生しました。')
        setLoading(false)
        return
      }

      if (existingCompany) {
        alert('同じ法人名がすでに登録されています。')
        setLoading(false)
        return
      }

      // ② 登録処理（user_id追加済み）
      const { error: insertError } = await supabase.from('companies').insert([
        {
          name: companyName,
          parent_company_id: parentCompanyId,
          user_id: userId, // ← ここが追加された点
        }
      ])

      if (insertError) {
        console.error('子会社登録エラー:', insertError.message)
        alert('子会社の登録に失敗しました。')
      } else {
        alert('子会社を登録しました！')
        router.push('/dashboard')
      }

    } catch (error) {
      console.error('予期せぬエラー:', error)
      alert('予期せぬエラーが発生しました。')
    } finally {
      setLoading(false)
    }
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
            placeholder="例：株式会社〇〇"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? '登録中...' : '登録する'}
        </button>
      </form>

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
