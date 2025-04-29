'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import { Clock, AlertCircle, ChevronRight, ChevronDown, Settings, LogOut, PlusCircle, Search, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Vehicle = {
  id: string
  number_plate: string
  car_model: string
  color: string
  inspection_date: string
  company_id?: string
  company_name?: string
  branch_name: string
  garage_address?: string
  notification_type?: string
  user_id?: string
  next_due_date?: string | null
  last_oil_change_date?: string | null
  last_element_change_date?: string | null
  last_tire_change_date?: string | null
  last_battery_change_date?: string | null
}

type MaintenanceSchedule = {
  id: string
  vehicle_id: string
  company_id: string
  type?: string | null
  next_due_date?: string | null
  note?: string | null
}

export default function DashboardPage() {
  const [companyName, setCompanyName] = useState('')
  const [plan, setPlan] = useState('')
  const [trialRemainingDays, setTrialRemainingDays] = useState<number | null>(null)
  const [isTrialExpired, setIsTrialExpired] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [maintenanceCount, setMaintenanceCount] = useState<number>(0)
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceSchedule[]>([])
  const [openDetails, setOpenDetails] = useState<{ [key: string]: boolean }>({})

  const router = useRouter()
  const now = new Date()
  const currentMonth = now.getMonth() + 1
 
  const planLimits: Record<string, number> = {
    light: 3,
    standard: 20,
    premium: Infinity,
    trial_light: 3,
  }

  const maxVehicles = plan ? planLimits[plan] : null

    // 👇ここに getBadgeColor を追加する
    const getBadgeColor = (days: number) => {
      if (days < 0) return 'red'
      if (days <= 30) return 'yellow'
      return 'black'
    }

  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      const metadata = user?.user_metadata || {}

      // 会社IDが未登録で、会社名がある場合 → 自動登録
      if (!metadata.company_id && metadata.company_name) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert([{ name: metadata.company_name }])
          .select()
          .single()

        if (!companyError && companyData?.id) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { company_id: companyData.id },
          })
          if (updateError) {
            console.error('ユーザー更新失敗:', updateError.message)
          } else {
            console.log('✅ company_id を user_metadata に保存しました')
          }
        } else {
          console.error('会社登録失敗:', companyError?.message)
        }
      }

      // company_name を補完して保存
      if (!metadata.company_name && metadata.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('name')
          .eq('id', metadata.company_id)
          .single()

        if (companyData?.name) {
          await supabase.auth.updateUser({
            data: { company_name: companyData.name },
          })
          setCompanyName(companyData.name)
        }
      } else {
        setCompanyName(metadata.company_name || user?.email || '')
      }

      setPlan(metadata.plan || '')

      if (metadata.plan === 'trial_light') {
        const trialStartRaw = metadata.trial_start
        if (trialStartRaw) {
          const startDate = new Date(trialStartRaw)
          const today = new Date()
          const msPerDay = 1000 * 60 * 60 * 24
          const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / msPerDay)
          const remaining = 14 - daysPassed
          setTrialRemainingDays(remaining)
          setIsTrialExpired(remaining <= 0)
        } else {
          setTrialRemainingDays(14)
          setIsTrialExpired(false)
        }
      }

// ① 子会社も含めて取得
const { data: subsidiaries } = await supabase
  .from('companies')
  .select('id')
  .eq('parent_company_id', metadata.company_id)

const companyIds = [metadata.company_id, ...(subsidiaries?.map(s => s.id) || [])]

// ② companyIds を使って maintenance_schedule を取得
const { data: maintenanceData, error: maintenanceError } = await supabase
  .from('maintenance_schedule')
  .select('*')
  .in('company_id', companyIds)   // ← companyIds はここで定義済みなので使える！

if (!maintenanceError && maintenanceData) {
  setMaintenanceData(maintenanceData)
}

// 車両データ取得
const { data: vehicleData, error: vehicleError } = await supabase
  .from('vehicles')
  .select('*')
  .in('company_id', companyIds)
  .order('inspection_date', { ascending: true })

  console.log('vehicleData:', vehicleData)


      if (!vehicleError && vehicleData && maintenanceData) {
        const mergedVehicles = vehicleData.map(vehicle => {
          const maintenance = maintenanceData.find(m => m.vehicle_id === vehicle.id)
          return {
            ...vehicle,
            next_due_date: maintenance?.next_due_date || null,
          }
        })
      
        setVehicles(mergedVehicles)
      }      

      if (!maintenanceError && maintenanceData) {
        const upcoming = maintenanceData.filter((item) => {
          if (!item.next_due_date) return false
          const dueMonth = new Date(item.next_due_date).getMonth() + 1
          return dueMonth === new Date().getMonth() + 1
        })
        setMaintenanceCount(upcoming.length)
      }

      setLoading(false)
    }

    checkSessionAndFetchData()
  }, [router])

  const thisMonthVehicles = vehicles.filter((v) => {
    const month = new Date(v.inspection_date).getMonth() + 1
    return month === currentMonth
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
  
  const getUrgentVehicles = (vehicles: Vehicle[], maintenanceData: MaintenanceSchedule[]) => {
    const today = new Date()
  
    const urgentList: {
      vehicle: Vehicle
      labels: string[]
      minDays: number
    }[] = []
  
    vehicles.forEach((v) => {
      const addMonths = (date: Date, months: number) => {
        const result = new Date(date)
        result.setMonth(result.getMonth() + months)
        return result
      }
  
      const maintenance = maintenanceData.find(m => m.vehicle_id === v.id)
  
      const datesToCheck = [
        { date: new Date(v.inspection_date), label: '車検' },
        { date: maintenance?.next_due_date ? new Date(maintenance.next_due_date) : null, label: '法定点検' },
        { date: v.last_oil_change_date ? addMonths(new Date(v.last_oil_change_date), 6) : null, label: 'オイル交換' },
        { date: v.last_element_change_date ? addMonths(new Date(v.last_element_change_date), 12) : null, label: 'エレメント交換' },
        { date: v.last_tire_change_date ? addMonths(new Date(v.last_tire_change_date), 36) : null, label: 'タイヤ交換' },
        { date: v.last_battery_change_date ? addMonths(new Date(v.last_battery_change_date), 36) : null, label: 'バッテリー交換' },
      ]
  
      const urgentLabels: string[] = []
      const daysList: number[] = []
  
      datesToCheck.forEach(d => {
        if (d.date) {
          const daysDiff = (d.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          if (daysDiff <= 60) {
            urgentLabels.push(d.label)
            daysList.push(daysDiff)
          }
        }
      })
  
      if (urgentLabels.length > 0) {
        urgentList.push({
          vehicle: v,
          labels: urgentLabels,
          minDays: Math.min(...daysList),
        })
      }
    })
  
    // ✅ ここで車検期限順に並び替え
    return urgentList.sort((a, b) => {
      const dateA = new Date(a.vehicle.inspection_date)
      const dateB = new Date(b.vehicle.inspection_date)
      return dateA.getTime() - dateB.getTime()
    })
  }  
  
  const urgentVehicles = getUrgentVehicles(vehicles, maintenanceData)
  console.log('urgentVehicles:', urgentVehicles)
  
return (
    <div className={styles.pageWrapper}>
      <div className={styles.brandHeader}>
        <Image src="/logo/logo.png" alt="車検くんロゴ" width={160} height={40} className={styles.logoMain} />
        <span className={styles.brandSubtitle}>法人向け車両管理システム</span>
      </div>
  
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <LayoutDashboard size={30} />
          <h1 className={styles.heading}>ダッシュボード</h1>
        </div>
  
        <p className={styles.subheading}>ようこそ、{companyName} 様</p>
  
        {plan === 'trial_light' && trialRemainingDays !== null && !isTrialExpired && (
          <div className={styles.trialBox}>
            <Clock className={styles.icon} />
            <p>お試し期間中：あと <strong>{trialRemainingDays}日</strong></p>
          </div>
        )}
  
        {plan === 'trial_light' && !isTrialExpired && (
          <div className={styles.upgradeBlock}>
            <p className={styles.upgradeMessage}>
              プレミアムなら整備通知・帳票・コスト分析まで一括管理が可能です。
            </p>
            <a href="/plans" className={styles.upgradeCTA}>
              プランをアップグレード <ChevronRight size={16} />
            </a>
          </div>
        )}
  
        {plan === 'trial_light' && isTrialExpired && (
          <div className={styles.trialExpired}>
            <AlertCircle className={styles.icon} />
            <p>お試し期間が終了しました。</p>
            <a href="/plans" className={styles.upgradeButton}>
              プランを選んで継続する
            </a>
          </div>
        )}
  
        <section className={styles.section}>
          <h2 className={styles.title}>登録状況</h2>
          <ul className={styles.stats}>
            <li>登録台数：{vehicles.length}台（上限：{maxVehicles === Infinity ? '無制限' : `${maxVehicles}台`}）</li>
            <li>今月車検予定：{thisMonthVehicles.length}台</li>
            <li>今月整備予定：{maintenanceCount}台</li>
          </ul>
        </section>
  
        <section className={styles.section}>
          <h2 className={styles.title}>期限が近い車両</h2>
          {loading ? (
            <p>読み込み中...</p>
          ) : urgentVehicles.length === 0 ? (
            <p>期限が近い車両はありません。</p>
          ) : (
            <ul className={styles.list}>
              {urgentVehicles.map(({ vehicle,minDays }) => {
                const today = new Date()
                const addMonths = (date: Date, months: number) => {
                  const result = new Date(date)
                  result.setMonth(result.getMonth() + months)
                  return result
                }
  
                const maintenance = maintenanceData.find(m => m.vehicle_id === vehicle.id)

                console.log('🚗 vehicle.id:', vehicle.id)
console.log('🛠️ 該当するmaintenance:', maintenance)
console.log('🗓️ maintenance?.next_due_date:', maintenance?.next_due_date)

                const details = [
                  { label: '車検', date: new Date(vehicle.inspection_date) },
                  { label: '法定点検', date: maintenance?.next_due_date ? new Date(maintenance.next_due_date) : null },  // ← maintenanceDataから直接取得
                  { label: 'オイル交換', date: vehicle.last_oil_change_date ? addMonths(new Date(vehicle.last_oil_change_date), 6) : null },
                  { label: 'エレメント交換', date: vehicle.last_element_change_date ? addMonths(new Date(vehicle.last_element_change_date), 12) : null },
                  { label: 'タイヤ交換', date: vehicle.last_tire_change_date ? addMonths(new Date(vehicle.last_tire_change_date), 36) : null },
                  { label: 'バッテリー交換', date: vehicle.last_battery_change_date ? addMonths(new Date(vehicle.last_battery_change_date), 36) : null },
                ].map(d => ({
                  ...d,
                  daysDiff: d.date ? Math.round((d.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
                })).filter(d => d.daysDiff !== null && d.daysDiff <= 60)
                
                const badgeColor = getBadgeColor(minDays)
                const badgeText = minDays < 0 ? '期限切れ' : `${Math.round(minDays)}日`
                
                return (
                  <li key={vehicle.id} className={styles.listItem}>
                    <div
                      onClick={() => setOpenDetails(prev => ({ ...prev, [vehicle.id]: !prev[vehicle.id] }))}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
  
  {/* アイコン追加 */}
  {openDetails[vehicle.id] ? (
    <ChevronDown size={18} />
  ) : (
    <ChevronRight size={18} />
  )}
  
  {/* バッジ */}
  <span className={styles[`badge_${badgeColor}`]}>
    {badgeText}
  </span>

  {/* 車両情報 */}
  <div>
    {vehicle.number_plate}｜{vehicle.car_model}（{vehicle.color}）<br />
    {vehicle.company_name} / {vehicle.branch_name}
  </div>
</div>

  
                    {openDetails[vehicle.id] && (
                      <ul className={styles.detailList}>
                        {details.map(detail => (
                          <li key={detail.label}>
                            <span className={styles[`badge_${getBadgeColor(detail.daysDiff!)}`]}>
                              {detail.daysDiff! < 0 ? '期限切れ' : `${detail.daysDiff}日`}
                            </span>
                            {detail.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
  
        <div className={styles.buttonWrapper}>
  {/* 上段 */}
  <div className={styles.buttons}>
    <Link href="/vehicles/new">
      <button className={styles.primaryButton}>
        <PlusCircle size={18} /> 新しい車両を登録する
      </button>
    </Link>
    <Link href="/vehicles">
      <button className={styles.secondaryButton}>
        <Search size={18} /> 登録一覧を確認する
      </button>
    </Link>
  </div>

  {/* 下段 */}
  <div className={styles.buttons}>
    <Link href="/companies/new">
      <button className={styles.subsidiaryButton}>
        + 子会社を登録する
      </button>
    </Link>
  
  </div>
</div>
  
        <div className={styles.settingsArea}>
          <div className={styles.linkGroup}>
            <a href="/plan/settings" className={styles.planLink}>
              <Settings size={16} /> プラン変更・解約
            </a>
            <button onClick={handleLogout} className={styles.logoutLink}>
              <LogOut size={16} /> ログアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  )  
};  