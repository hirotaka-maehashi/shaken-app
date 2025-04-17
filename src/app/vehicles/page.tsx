'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'

// 型定義（オプション：型安全）
type Vehicle = {
  id: string
  number_plate: string
  car_model: string
  color: string
  branch_name: string
  garage_address: string
  inspection_date: string
}

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const companyId = userData?.user?.user_metadata?.company_id

      if (!companyId) return

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', companyId)
        .order('inspection_date', { ascending: true })

      if (!error && data) {
        setVehicles(data)
      }

      setLoading(false)
    }

    fetchVehicles()
  }, [])

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>📋 車両一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : vehicles.length === 0 ? (
        <p>登録された車両がありません。</p>
      ) : (
        <ul className={styles.vehicleList}>
          {vehicles.map((v) => (
            <li key={v.id} className={styles.vehicleItem}>
              <strong>{v.number_plate}</strong>（{v.car_model} / {v.color}）<br />
              営業所：{v.branch_name} ／ 住所：{v.garage_address}<br />
              車検期限：{v.inspection_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
