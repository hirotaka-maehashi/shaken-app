'use client'

import styles from './page.module.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'

export default function PlansPage() {
  const [quantity, setQuantity] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // ✅ ダッシュボードと同じセッション確認＆ユーザー取得
  useEffect(() => {
  const fetchUser = async () => {
    // セッション復元のために少し遅延
    await new Promise((res) => setTimeout(res, 300))

    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      console.warn('❌ セッションがありません。ログイン画面へリダイレクトします。')
      router.push('/login')
      return
    }

    const { data: userData, error } = await supabase.auth.getUser()
    const user = userData.user

    if (user?.id) {
      setUserId(user.id)
      console.log('✅ userId:', user.id)
    } else {
      console.warn('⚠️ ユーザー情報が取得できませんでした')
    }

    if (error) {
      console.error('🚨 getUser エラー:', error)
    }
  }

  fetchUser()
}, [router])

const planLimits: Record<string, number> = {
  light: 10,
  standard: 20,
  premium: Infinity,
}

const getCurrentVehicleCount = async (companyId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)

  if (error) {
    console.error('登録台数取得エラー:', error.message)
    return 0
  }

  return count || 0
}

const handleSelectPlan = async (plan: string) => {
  if (!userId) {
    alert('ログイン情報が取得できませんでした')
    return
  }

  const { data: userData } = await supabase.auth.getUser()
  const metadata = userData.user?.user_metadata || {}
  const companyId = metadata.company_id

  if (!companyId) {
    alert('会社情報が取得できませんでした')
    return
  }

  const currentCount = await getCurrentVehicleCount(companyId)
  const limit = planLimits[plan]

  if (currentCount + quantity > limit) {
    alert(`すでに ${currentCount} 台登録されています。「${plan}プラン」の上限 ${limit} 台を超えるため、これ以上は登録できません。`)
    return
  }

  // ✅ 決済処理
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, quantity, user_id: userId }),
  })

  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
  } else {
    alert('決済ページへの遷移に失敗しました')
  }
}

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>ご利用プランのご案内</h1>

      {/* ステップ1：台数を選択 */}
      <div className={styles.instructionsBox}>
        <p className={styles.instructionsStep}>
          <strong>ステップ1：</strong> 必ず先に「台数」を選択してください。
        </p>
      </div>

      <div className={styles.selectorLarge}>
        <label>台数を選択：</label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        >
          {[...Array(20)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} 台
            </option>
          ))}
        </select>
      </div>

      {/* ステップ2：プランを選択 */}
      <div className={styles.instructionsBox}>
        <p className={styles.instructionsStep}>
          <strong>ステップ2：</strong> 選択後、希望するプランをクリックすると決済ページに遷移します。
        </p>
      </div>

      <div className={styles.planGrid}>
        <div
          className={styles.planCard}
          onClick={() => handleSelectPlan('light')}
          role="button"
          tabIndex={0}
        >
          <h2 className={styles.planTitle}>ライトプラン</h2>
          <p className={styles.price}>¥1,100 / 台（税込）</p>
          <ul className={styles.featureList}>
            <li>車両登録：最大10台</li>
            <li>期限通知（車検）</li>
            <li>通知方法：LINE / 担当者通知</li>
          </ul>
        </div>

        <div
          className={styles.planCard}
          onClick={() => handleSelectPlan('standard')}
          role="button"
          tabIndex={0}
        >
          <h2 className={styles.planTitle}>スタンダードプラン</h2>
          <p className={styles.price}>¥1,650 / 台（税込）</p>
          <ul className={styles.featureList}>
            <li>車両登録：最大20台</li>
            <li>期限通知（車検）</li>
            <li>通知方法：LINE / 担当者通知</li>
          </ul>
        </div>

        <div
          className={styles.planCard}
          onClick={() => handleSelectPlan('premium')}
          role="button"
          tabIndex={0}
        >
          <h2 className={styles.planTitle}>プレミアプラン</h2>
          <p className={styles.price}>¥2,200 / 台（税込）</p>
          <ul className={styles.featureList}>
            <li>車両登録：無制限</li>
            <li>期限通知（車検）</li>
            <li>通知方法：LINE / 担当者通知</li>
          </ul>
        </div>
      </div>

      <div className={styles.note}>
        <p>※ プランの変更・導入に関しては、LINEまたはお電話にてお気軽にご相談ください。</p>
        <a href="/contact" className={styles.contactButton}>
          無料相談はこちら →
        </a>
      </div>

      <div className={styles.backLinkWrapper}>
        <Link href="/dashboard" className={styles.backButton}>
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )
}
