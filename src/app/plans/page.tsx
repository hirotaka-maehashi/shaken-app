'use client'

import styles from './page.module.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアント（公開キー使用）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PlansPage() {
  const [quantity, setQuantity] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  // ログイン中ユーザーの取得
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data?.user?.id ?? null)
    }
    fetchUser()
  }, [])

  // プラン選択ハンドラ
  const handleSelectPlan = async (plan: string) => {
    if (!userId) {
      alert('ログイン情報が取得できませんでした')
      return
    }

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
            <li>車両登録：最大3台</li>
            <li>期限通知（車検）</li>
            <li>通知方法：LINEグループ / 担当者通知</li>
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
            <li>整備スケジュール管理</li>
            <li>修理工場登録</li>
            <li>通知履歴の確認</li>
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
            <li>整備記録・AI整備提案</li>
            <li>コスト分析／PDF帳票出力</li>
            <li>外観チェック（画像比較）</li>
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
