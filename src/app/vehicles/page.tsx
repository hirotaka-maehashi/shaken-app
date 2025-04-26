'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import Link from 'next/link'
import {
  MapPin,
  Building2,
  CalendarClock,
  Bell,
  ArrowLeft,
  PlusCircle
} from 'lucide-react'


// 型定義（オプション：型安全）
type Vehicle = {
  id: string
  number_plate: string
  car_model: string
  color: string
  branch_name: string
  garage_address: string
  inspection_date: string
  notification_type: string
}

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<string[]>([])
  const [visibleBranches, setVisibleBranches] = useState<Set<string>>(new Set())

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
        const uniqueBranches = Array.from(new Set(data.map((v) => v.branch_name)))
        setBranches(uniqueBranches)
        setVisibleBranches(new Set(uniqueBranches)) // 初期状態は全て表示
      }

      setLoading(false)
    }

    fetchVehicles()
  }, [])

  const toggleBranch = (branch: string) => {
    setVisibleBranches((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(branch)) {
        newSet.delete(branch)
      } else {
        newSet.add(branch)
      }
      return newSet
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>車両一覧</h1>
      </div>
  
      {branches.length > 0 && (
        <div className={styles.filterArea}>
          <h3><MapPin size={18} /> 拠点ごとの表示切り替え：</h3>
          {branches.map((branch) => {
            const total = vehicles.filter((v) => v.branch_name === branch).length
            return (
              <label key={branch} className={styles.branchToggle}>
                <input
                  type="checkbox"
                  checked={visibleBranches.has(branch)}
                  onChange={() => toggleBranch(branch)}
                />
                {branch}（{total}台）
              </label>
            )
          })}
        </div>
      )}
  
      {loading ? (
        <p>読み込み中...</p>
      ) : vehicles.length === 0 ? (
        <p>登録された車両がありません。</p>
      ) : (
        <ul className={styles.vehicleList}>
          {vehicles
            .filter((v) => visibleBranches.has(v.branch_name))
            .map((v) => (
              <li key={v.id} className={styles.vehicleItem}>
                <strong>{v.number_plate}</strong>（{v.car_model} / {v.color}）<br />
                <Building2 size={16} /> 営業所：{v.branch_name} ／ 住所：{v.garage_address}<br />
                <CalendarClock size={16} /> 車検期限：{v.inspection_date}<br />
                <Bell size={16} /> 通知方法：{v.notification_type === 'group' ? 'LINEグループ' : '担当者通知'}
              </li>
            ))}
        </ul>
      )}
  
      <div className={styles.buttonWrapper}>
        <Link href="/dashboard">
          <button className={styles.secondaryButton}><ArrowLeft size={16} /> ダッシュボードに戻る</button>
        </Link>
        <Link href="/vehicles/new">
          <button className={styles.primaryButton}><PlusCircle size={16} /> 車両を登録する</button>
        </Link>
      </div>
    </div>
  )
};  