'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import { Clock, AlertCircle, ChevronRight, Settings, LogOut, PlusCircle, Search, LayoutDashboard } from 'lucide-react'
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
}

export default function DashboardPage() {
  const [companyName, setCompanyName] = useState('')
  const [plan, setPlan] = useState('')
  const [trialRemainingDays, setTrialRemainingDays] = useState<number | null>(null)
  const [isTrialExpired, setIsTrialExpired] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [maintenanceCount, setMaintenanceCount] = useState<number>(0)
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

      const { data: maintenanceData, error: maintenanceError } = await supabase
      .from('maintenance_schedule')
      .select('*')
      .eq('company_id', metadata.company_id)   


// 子会社も含めて取得
const { data: subsidiaries } = await supabase
  .from('companies')
  .select('id')
  .eq('parent_company_id', metadata.company_id)

const companyIds = [metadata.company_id, ...(subsidiaries?.map(s => s.id) || [])]

// 車両データ取得
const { data: vehicleData, error: vehicleError } = await supabase
  .from('vehicles')
  .select('*')
  .in('company_id', companyIds)
  .order('inspection_date', { ascending: true })

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

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.brandHeader}>
      <Image src="/logo/logo.png"alt="車検くんロゴ"width={160}height={40}className={styles.logoMain}/>
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
            <li>
              登録台数：{vehicles.length}台（上限：{maxVehicles === Infinity ? '無制限' : `${maxVehicles}台`}）
            </li>
            <li>今月車検予定：{thisMonthVehicles.length}台</li>
            <li>今月整備予定：{maintenanceCount}台</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.title}>期限が近い車両</h2>
          {loading ? (
            <p>読み込み中...</p>
          ) : vehicles.length === 0 ? (
            <p>登録された車両はまだありません。</p>
          ) : (
            <ul className={styles.list}>
            {vehicles.slice(0, 5).map((v) => (
              <li key={v.id} className={styles.listItem}>
                <strong>{v.number_plate}</strong>｜{v.car_model}（{v.color}）<br />
                {v.company_name} / {v.branch_name} / 車検期限: {v.inspection_date}<br />
                {v.next_due_date ? `🔧 次回整備予定日: ${v.next_due_date}` : '🔧 整備予定なし'}
              </li>
            ))}
          </ul>          
          )}
        </section>

        <div className={styles.buttonWrapper}>
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
}