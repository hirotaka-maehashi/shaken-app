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
    const fetchInitialData = async () => {
      // 1. ユーザー情報を取得
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      const userCompanyId = user?.user_metadata?.company_id
      const userId = user?.id
  
      if (!userCompanyId || !userId) {
        console.warn('ユーザー情報または company_id が取得できません')
        return
      }
  
      // 2. 初期フォームデータに company_id をセット
      setFormData((prev) => ({
        ...prev,
        company_id: userCompanyId,
      }))
  
      // 3. 自分が登録した法人のみ取得
      const { data: myCompanies, error } = await supabase
        .from('companies')
        .select('id, name, parent_company_id')
        .eq('user_id', userId)
  
      if (error) {
        console.error('companies取得エラー:', error.message)
        return
      }
  
      setCompanies(myCompanies || [])
    }
  
    fetchInitialData()
  }, [])  

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
    oil_change_date: '',
    element_change_date: '',
    tire_change_date: '',
    battery_change_date: '',
    last_oil_change_date: '',         
    last_element_change_date: '',      
    last_tire_change_date: '',       
    last_battery_change_date: '',      
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMaintenanceData({ ...maintenanceData, [e.target.name]: e.target.value })
  }

  // 空文字ならnullに変換する関数
const normalizeDateField = (value: string) => {
  return value === '' ? null : value
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

const restFormData = formData

const filteredFormData = {
  company_id: restFormData.company_id,
  branch_name: restFormData.branch_name,
  number_plate: restFormData.number_plate,
  car_model: restFormData.car_model,
  color: restFormData.color,
  inspection_date: normalizeDateField(restFormData.inspection_date),
  garage_address: restFormData.garage_address,
  line_group_id: restFormData.line_group_id,
  notify_name: restFormData.notify_name,
  notify_address: restFormData.notify_address,
  note: restFormData.note,
  oil_change_date: normalizeDateField(restFormData.oil_change_date),
  element_change_date: normalizeDateField(restFormData.element_change_date),
  tire_change_date: normalizeDateField(restFormData.tire_change_date),
  battery_change_date: normalizeDateField(restFormData.battery_change_date),
  last_oil_change_date: normalizeDateField(restFormData.last_oil_change_date),
  last_element_change_date: normalizeDateField(restFormData.last_element_change_date),
  last_tire_change_date: normalizeDateField(restFormData.last_tire_change_date),
  last_battery_change_date: normalizeDateField(restFormData.last_battery_change_date),
}

const companyIdToUse = formData.company_id
    // 選択された会社IDから会社名を取得
    const selectedCompanyName =
      companies.find((c) => c.id === companyIdToUse)?.name || ''
    
      console.log('送信前のfilteredFormData:', filteredFormData)

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
        {/* 基本情報 */}
        {/* --- ここは変わらずそのまま --- */}
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
  <input
    type="text"
    name="branch_name"
    required
    placeholder="例：東京営業所"
    onChange={handleChange}
    value={formData.branch_name}
    className={styles.input}
  />
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
  
        {/* 整備スケジュール */}
        <hr className={styles.divider} />
        <h2 className={styles.subheading}>初回整備スケジュール（任意）</h2>
  
        {/* 車検・点検 */}
        <div className={styles.group}>
          <label className={styles.label}>整備種別（車検・法定点検）</label>
          <input
            name="type"
            placeholder="例：法定6ヶ月点検"
            onChange={handleMaintenanceChange}
            className={styles.input}
          />
        </div>
  
        <div className={styles.group}>
          <label className={styles.label}>次回整備予定日（車検・点検）</label>
          <input
            name="next_due_date"
            type="date"
            onChange={handleMaintenanceChange}
            className={styles.input}
          />
        </div>
  
        {/* 最終整備日 */}
        <div className={styles.group}>
          <label className={styles.label}>最終エンジンオイル交換日</label>
          <input
            type="date"
            name="last_oil_change_date"
            onChange={handleChange}
            value={formData.last_oil_change_date}
            className={styles.input}
          />
        </div>
  
        <div className={styles.group}>
          <label className={styles.label}>最終オイルエレメント交換日</label>
          <input
            type="date"
            name="last_element_change_date"
            onChange={handleChange}
            value={formData.last_element_change_date}
            className={styles.input}
          />
        </div>
  
        <div className={styles.group}>
          <label className={styles.label}>最終タイヤ交換日</label>
          <input
            type="date"
            name="last_tire_change_date"
            onChange={handleChange}
            value={formData.last_tire_change_date}
            className={styles.input}
          />
        </div>
  
        <div className={styles.group}>
          <label className={styles.label}>最終バッテリー交換日</label>
          <input
            type="date"
            name="last_battery_change_date"
            onChange={handleChange}
            value={formData.last_battery_change_date}
            className={styles.input}
          />
        </div>
  
        {/* 整備メモ */}
        <div className={styles.group}>
          <label className={styles.label}>整備メモ（任意）</label>
          <textarea
            name="note"
            placeholder="例：オイル交換も実施予定"
            onChange={handleMaintenanceChange}
            className={styles.textarea}
          />
        </div>
  
        {/* ボタン */}
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
  