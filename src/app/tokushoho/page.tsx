'use client'

import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function TokushohoPage() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>特定商取引法に基づく表記</h1>

      <p className={styles.item}><strong>販売事業者名：</strong> スター株式会社（shakenapp運営）</p>
      <p className={styles.item}><strong>代表責任者：</strong> 前橋 洋孝</p>
      <p className={styles.item}><strong>所在地：</strong> 〒442-0855 愛知県豊川市新栄町2-49</p>
      <p className={styles.item}><strong>電話番号：</strong> 080-1612-1176（受付時間：平日10:00〜17:00）</p>
      <p className={styles.item}><strong>メールアドレス：</strong> starcorporation2024@gmail.com</p>
      <p className={styles.item}><strong>販売価格：</strong> サービスページに表示された価格（月額・年額）</p>
      <p className={styles.item}><strong>商品代金以外の必要料金：</strong> なし</p>
      <p className={styles.item}><strong>引き渡し時期：</strong> 決済完了後、即日ご利用いただけます</p>
      <p className={styles.item}><strong>支払方法：</strong> クレジットカード（Stripe決済）</p>
      <p className={styles.item}><strong>キャンセル・返金について：</strong> サービスの性質上、契約期間中の途中解約および返金には応じておりません</p>
      <p className={styles.item}><strong>サービス提供形態：</strong> 本サービスは、法人・事業者向けに提供するクラウド型の車両管理SaaSです。ブラウザを通じてアクセス・利用可能です。</p>

      <div className={styles.buttonWrapper}>
        <button
          onClick={() => router.push('/dashboard')}
          className={styles.backButton}
        >
          ← ダッシュボードに戻る
        </button>
      </div>
    </div>
  )
}
