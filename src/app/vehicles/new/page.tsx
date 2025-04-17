'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'

export default function NewVehiclePage() {
  const router = useRouter()
  const [notificationType, setNotificationType] = useState('group')
  const [companyId, setCompanyId] = useState('') // ← 正しい変数名に統一（キャメルケース）

  // 会社IDを取得
  useEffect(() => {
    const fetchCompanyId = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const metadata = userData?.user?.user_metadata
      if (metadata?.company_id) {
        setCompanyId(metadata.company_id)
      }
    }
    fetchCompanyId()
  }, [])

  // フォームデータ
  const [formData, setFormData] = useState({
    company_name: '',
    branch_name: '',
    number_plate: '',
    car_model: '',
    color: '',
    inspection_date: '',
    garage_address: '',
    line_group_id: '',
    notify_name: '',
    notify_address: '',
    note: '',
  })

  // 入力変更時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: userData } = await supabase.auth.getUser()
    const user_id = userData?.user?.id

    const { error } = await supabase.from('vehicles').insert([
      {
        user_id,
        company_id: companyId, // ← ステートから取得した companyId を保存！
        ...formData,
        notification_type: notificationType,
      }
    ])

    if (error) {
      alert('登録に失敗しました: ' + error.message)
    } else {
      alert('登録が完了しました')
      router.refresh()
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>車両情報の登録</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 以下は必要に応じて company_name 入力を消すことも可能！ */}
        <div className={styles.group}>
          <label className={styles.label}>営業所・拠点名</label>
          <input name="branch_name" required placeholder="例：東京営業所" onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>ナンバー</label>
          <input name="number_plate" required placeholder="例：品川 300 あ 12-34" onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>車種</label>
          <input name="car_model" required placeholder="例：トヨタ ハイエース" onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>色</label>
          <input name="color" required placeholder="例：シルバー" onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>車検期限</label>
          <input type="date" name="inspection_date" required onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>使用場所（車庫の住所）</label>
          <input name="garage_address" required placeholder="例：東京都品川区〇〇" onChange={handleChange} className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>通知方法</label>
          <select
            name="notification_type"
            onChange={(e) => setNotificationType(e.target.value)}
            className={styles.input}
          >
            <option value="group">LINEグループ通知</option>
            <option value="direct">担当者に個別通知</option>
          </select>
        </div>

        {notificationType === 'group' && (
          <div className={styles.group}>
            <label className={styles.label}>LINEグループID</label>
            <input name="line_group_id" required placeholder="例：line-group-1234" onChange={handleChange} className={styles.input} />
          </div>
        )}

        {notificationType === 'direct' && (
          <>
            <div className={styles.group}>
              <label className={styles.label}>通知先 担当者名</label>
              <input name="notify_name" required placeholder="例：田中太郎" onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>通知先 連絡先（メールまたはLINE ID）</label>
              <input name="notify_address" required placeholder="例：tanaka@example.com" onChange={handleChange} className={styles.input} />
            </div>
          </>
        )}

        <div className={styles.group}>
          <label className={styles.label}>備考（任意）</label>
          <textarea name="note" placeholder="例：夏にタイヤ交換予定" onChange={handleChange} className={styles.textarea} />
        </div>

        <button type="submit" className={styles.button}>登録する</button>
      </form>
    </div>
  )
}