'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import Link from 'next/link'

export default function NewBranchPage() {
  const [branchName, setBranchName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const user_id = userData?.user?.id || null
      const company_id = userData?.user?.user_metadata?.company_id || null
      const company_name = userData?.user?.user_metadata?.company_name || null

      if (!company_id || !user_id) {
        alert('ユーザー情報の取得に失敗しました。再ログインしてください。')
        setLoading(false)
        return
      }

      const { error } = await supabase.from('vehicles').insert([
        {
          user_id,
          company_id,
          company_name,
          branch_name: branchName,
          number_plate: '',
          car_model: '',
          color: '',
          inspection_date: null,
          garage_address: '',
          notification_type: 'group',
        }
      ])

      if (error) {
        console.error('登録エラー:', error.message)
        alert('拠点の登録に失敗しました。')
      } else {
        alert('拠点名（仮車両）を登録しました！')
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
      <h1 className={styles.heading}>拠点名を登録する</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label}>拠点名</label>
          <input
            type="text"
            className={styles.input}
            placeholder="例：東京支店"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
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
