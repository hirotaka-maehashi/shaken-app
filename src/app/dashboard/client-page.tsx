'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import { Clock, AlertCircle, ChevronRight, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { PlusCircle, Search } from 'lucide-react'
import { LayoutDashboard } from 'lucide-react'

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

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user?.id)
        .order('inspection_date', { ascending: true })

      if (!error && data) {
        setVehicles(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const thisMonthVehicles = vehicles.filter((v) => {
    const month = new Date(v.inspection_date).getMonth() + 1
    return month === currentMonth
  })
  const router = useRouter() // ← 先に呼び出す
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }  

 return (
  <div className={styles.pageWrapper}>
    {/* ブランド表示 */}
    <div className={styles.brandHeader}>
  <img src="/logo/logo.png" alt="車検くんロゴ" className={styles.logoMain} />
  <span className={styles.brandSubtitle}>法人向け車両管理システム</span>
</div>


    {/* メインコンテンツ */}
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <LayoutDashboard size={30} />
        <h1 className={styles.heading}>ダッシュボード</h1>
      </div>

      <p className={styles.subheading}>ようこそ、{companyName} 様</p>

      {/* トライアル表示 */}
      {plan === 'trial_light' && trialRemainingDays !== null && !isTrialExpired && (
        <div className={styles.trialBox}>
          <Clock className={styles.icon} />
          <p>お試し期間中：あと <strong>{trialRemainingDays}日</strong></p>
        </div>
      )}

      {/* アップグレード案内 */}
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

      {/* お試し終了案内 */}
      {plan === 'trial_light' && isTrialExpired && (
        <div className={styles.trialExpired}>
          <AlertCircle className={styles.icon} />
          <p>お試し期間が終了しました。</p>
          <a href="/plans" className={styles.upgradeButton}>
            プランを選んで継続する
          </a>
        </div>
      )}

      {/* 登録状況セクション */}
      <section className={styles.section}>
        <h2 className={styles.title}>登録状況</h2>
        <ul className={styles.stats}>
          <li>登録台数：{vehicles.length}台</li>
          <li>今月車検予定：{thisMonthVehicles.length}台</li>
        </ul>
      </section>

      {/* 車両一覧セクション */}
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

      {/* アクションボタン */}
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

      {/* プラン変更／ログアウト */}
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