'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import { Clock, AlertCircle, ChevronRight, Settings, LogOut, PlusCircle, Search, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Vehicle = {
  id: string
  number_plate: string
  car_model: string
  color: string
  inspection_date: string
  company_name: string
  branch_name: string
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
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      const metadata = user?.user_metadata || {}

      setCompanyName(metadata.company_name || user?.email || '')
      setPlan(metadata.plan || '')

      if (metadata.plan === 'trial_light' && metadata.trial_start) {
        const startDate = new Date(metadata.trial_start)
        const today = new Date()
        const msPerDay = 1000 * 60 * 60 * 24
        const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / msPerDay)
        const remaining = 14 - daysPassed
        setTrialRemainingDays(remaining)
        setIsTrialExpired(remaining <= 0)
      }

      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user?.id)
        .order('inspection_date', { ascending: true })

      if (!vehicleError && vehicleData) {
        setVehicles(vehicleData)
      }

      // 整備予定取得（今月分）
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_schedule')
        .select('next_due_date')
        .eq('company_id', metadata.company_id)

      if (!maintenanceError && maintenanceData) {
        const upcoming = maintenanceData.filter((item) => {
          const dueMonth = new Date(item.next_due_date).getMonth() + 1
          return dueMonth === currentMonth
        })
        setMaintenanceCount(upcoming.length)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

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
        <img src="/logo/logo.png" alt="車検くんロゴ" className={styles.logoMain} />
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
                  {v.company_name} / {v.branch_name} / {v.inspection_date}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className={styles.buttonWrapper}>
          <div className={styles.buttons}>
            <a href="/vehicles/new" className={styles.primaryButton}>
              <PlusCircle size={18} /> 新しい車両を登録する
            </a>
            <a href="/vehicles" className={styles.secondaryButton}>
              <Search size={18} /> 登録一覧を確認する
            </a>
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