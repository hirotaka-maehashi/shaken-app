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
  PlusCircle,
  Trash2
} from 'lucide-react'


type Vehicle = {
  id: string
  company_id: string 
  number_plate: string
  car_model: string
  color: string
  branch_name: string
  garage_address: string
  inspection_date: string
  notification_type: string
  next_due_date?: string | null
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
  
      // 子会社も含めて取得する処理を追加
      const { data: subsidiaries } = await supabase
        .from('companies')
        .select('id')
        .eq('parent_company_id', companyId)
  
      const companyIds = [companyId, ...(subsidiaries?.map(s => s.id) || [])]
  
      // 車両データをまとめて取得（親会社＋子会社）
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .in('company_id', companyIds)
        .order('inspection_date', { ascending: true })
  
      // メンテナンススケジュールもまとめて取得（親会社＋子会社）
      const { data: maintenanceData } = await supabase
        .from('maintenance_schedule')
        .select('*')
        .in('company_id', companyIds)
  
      if (!vehicleError && vehicleData && maintenanceData) {
        const mergedVehicles = vehicleData.map(vehicle => {
          const maintenance = maintenanceData.find(m => m.vehicle_id === vehicle.id)
          return {
            ...vehicle,
            next_due_date: maintenance?.next_due_date || null,
          }
        })
  
        setVehicles(mergedVehicles)
  
        const uniqueBranches = Array.from(new Set(mergedVehicles.map((v) => v.branch_name)))
        setBranches(uniqueBranches)
        setVisibleBranches(new Set(uniqueBranches))
      }
  
      setLoading(false)
    }
  
    fetchVehicles()
  }, [])  //

  // 🔥 追加した handleDelete 関数！
  const handleDelete = async (vehicleId: string) => {
    const confirmDelete = window.confirm('この車両を削除してもよろしいですか？')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)

    if (!error) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleId))
    } else {
      console.error('削除エラー:', error.message)
    }
  }

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

  const [companies, setCompanies] = useState<{ id: string; name: string; parent_company_id?: string | null }[]>([])

useEffect(() => {
  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('id, name, parent_company_id')
    if (!error && data) {
      setCompanies(data)
    }
  }
  fetchCompanies()
}, [])

const [displayMode, setDisplayMode] = useState('company') // company または branch を切り替え
const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())
const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set())

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>車両一覧</h1>
      </div>

{companies.length > 0 && (
 <div className={styles.filterArea}>
 <h3>表示モード：</h3>
 <select
   className={styles.selectBox}
   value={displayMode}
   onChange={(e) => setDisplayMode(e.target.value)}
 >
   <option value="company">会社ごとに表示</option>
   <option value="branch">拠点ごとに表示</option>
 </select>
</div>
)}

{displayMode === 'company' && companies.length > 0 && (
  <div className={styles.filterArea}>
    <h3><Building2 size={18} /> 会社ごとの表示切り替え：</h3>
    {companies.map((company) => (
      <label key={company.id} className={styles.branchToggle}>
        <input
          type="checkbox"
          checked={selectedCompanies.size === 0 || selectedCompanies.has(company.id)}
          onChange={() => {
            setSelectedCompanies(prev => {
              const newSet = new Set(prev)
              if (newSet.has(company.id)) newSet.delete(company.id)
              else newSet.add(company.id)
              return newSet
            })
          }}
        />
        {company.name} {company.parent_company_id ? '(子会社)' : '(親会社)'}
      </label>
    ))}
  </div>
)}

{displayMode === 'branch' && branches.length > 0 && (
  <div className={styles.filterArea}>
    <h3><MapPin size={18} /> 拠点ごとの表示切り替え：</h3>
    {branches.map((branch) => (
      <label key={branch} className={styles.branchToggle}>
        <input
          type="checkbox"
          checked={selectedBranches.size === 0 || selectedBranches.has(branch)}
          onChange={() => {
            setSelectedBranches(prev => {
              const newSet = new Set(prev)
              if (newSet.has(branch)) newSet.delete(branch)
              else newSet.add(branch)
              return newSet
            })
          }}
        />
        {branch}
      </label>
    ))}
  </div>
)}
      {loading ? (
        <p>読み込み中...</p>
      ) : vehicles.length === 0 ? (
        <p>登録された車両がありません。</p>
      ) : (
        <ul className={styles.vehicleList}>
{vehicles
  .filter((v) => {
    if (displayMode === 'company') {
      return selectedCompanies.size === 0 || selectedCompanies.has(v.company_id)
    } else {
      return selectedBranches.size === 0 || selectedBranches.has(v.branch_name)
    }
  })
            .map((v) => (
              <li key={v.id} className={styles.vehicleItem}>
                <strong>{v.number_plate}</strong>（{v.car_model} / {v.color}）<br />
                <Building2 size={16} /> 営業所：{v.branch_name} ／ 住所：{v.garage_address}<br />
                <CalendarClock size={16} /> 車検期限：{v.inspection_date}<br />
                {v.next_due_date ? (
  <>
    <CalendarClock size={16} /> 次回整備予定日：{v.next_due_date}<br />
  </>
) : (
  <>
    <CalendarClock size={16} /> 整備予定なし<br />
  </>
)}
                <Bell size={16} /> 通知方法：{v.notification_type === 'group' ? 'LINEグループ' : '担当者通知'}<br />
                <button onClick={() => handleDelete(v.id)} className={styles.deleteButton}>
  <Trash2 size={16} /> 車両を削除する
</button>

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
}
