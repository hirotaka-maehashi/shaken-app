'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NewVehiclePage() {
  const router = useRouter()

  const [notificationType, setNotificationType] = useState('group')
  const [companies, setCompanies] = useState<{ id: string; name: string; parent_company_id?: string | null }[]>([])
  const [maintenanceData, setMaintenanceData] = useState({
    type: '',
    next_due_date: '',
    note: '',
  })

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase.from('companies').select('id, name, parent_company_id')
      if (!error && data) {
        setCompanies(data)
      }
    }
    fetchCompanies()
  }, [])

  const [formData, setFormData] = useState({
    company_id: '',
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

  
  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase.from('companies').select('id, name, parent_company_id')
      if (!error && data) {
        setCompanies(data)
      }
    }
    fetchCompanies()
  }, [])  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMaintenanceData({ ...maintenanceData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: userDataForPlan } = await supabase.auth.getUser()
    const user = userDataForPlan?.user
    const plan = user?.user_metadata?.plan || 'light'
    const planLimits: Record<string, number> = {
      light: 3,
      standard: 20,
      premium: Infinity,
    }
    const maxVehicles = planLimits[plan]

    const { count, error: countError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', formData.company_id)

    if (countError) {
      alert('台数確認に失敗しました: ' + countError.message)
      return
    }
    if (count !== null && maxVehicles !== Infinity && count >= maxVehicles) {
      alert(`このプランでは ${maxVehicles} 台まで登録できます。プランアップグレードをご検討ください。`)
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const user_id = userData?.user?.id

    const session = await supabase.auth.getSession()
console.log('JWTの中身:', session.data.session?.user)

const filteredFormData = formData
    
    // 選択された会社IDから会社名を取得
    const selectedCompanyName =
    companies.find((c) => c.id === formData.company_id)?.name || ''  
    
    const { data: insertedVehicle, error } = await supabase
      .from('vehicles')
      .insert([
        {
          user_id,
          ...filteredFormData,
          company_name: selectedCompanyName, // ← 明示的に追加
          notification_type: notificationType,
        },
      ])
      .select()
      .single()    

    if (error || !insertedVehicle) {
      console.log('❌ vehicle insert error:', error)
      alert('登録に失敗しました: ' + error?.message)
      return
    }

    console.log('送信データ:', {
      user_id,
      company_id: formData.company_id,
      vehicle_id: insertedVehicle.id,
      type: maintenanceData.type,
      next_due_date: maintenanceData.next_due_date,
      note: maintenanceData.note,
    })
        

    const { error: maintenanceError } = await supabase.from('maintenance_schedule').insert([
      {
        user_id, // ← 追加
        company_id: formData.company_id,
        vehicle_id: insertedVehicle.id,
        type: maintenanceData.type,
        next_due_date: maintenanceData.next_due_date,
        note: maintenanceData.note,
      },
    ])    

    if (maintenanceError) {
      alert('整備予定の登録に失敗しました: ' + maintenanceError.message)
    } else {
      alert('車両と整備予定を登録しました')
      router.refresh()
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>車両情報の登録</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label}>使用法人</label>
          <select
            name="company_id"
            required
            onChange={handleChange}
            className={styles.input}
            value={formData.company_id}
          >
            <option value="">選択してください</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} {company.parent_company_id ? '(子会社)' : '(親会社)'}
              </option>
            ))}
          </select>
        </div>

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

        <hr className={styles.divider} />
        <h2 className={styles.subheading}>初回整備スケジュール（任意）</h2>

        <div className={styles.group}>
          <label className={styles.label}>整備種別</label>
          <input name="type" placeholder="例：法定6ヶ月点検" onChange={handleMaintenanceChange} className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>整備予定日</label>
          <input name="next_due_date" type="date" onChange={handleMaintenanceChange} className={styles.input} />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>整備メモ（任意）</label>
          <textarea name="note" placeholder="例：オイル交換も実施予定" onChange={handleMaintenanceChange} className={styles.textarea} />
        </div>

        <div className={styles.buttonGroupWrapper}>
          <div className={styles.sideButtons}>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className={styles.secondaryButton}
            >
              ← ダッシュボードに戻る
            </button>

            <Link href="/vehicles">
              <button className={styles.secondaryButton}>
                <Search size={18} /> 登録一覧を確認する
              </button>
            </Link>
          </div>

          <button type="submit" className={styles.primaryButton}>
            登録する
          </button>
        </div>
      </form>
    </div>
  )
  };  
