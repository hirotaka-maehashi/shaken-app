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
      <p className={styles.item}><strong>販売価格：</strong> 各サービスページに税込価格で表示。例：月額1,100円/1台・1人あたり（ご利用内容により変動）</p>
      <p className={styles.item}><strong>商品代金以外の必要料金：</strong> インターネット接続に必要な通信費等はお客様のご負担となります</p>
      <p className={styles.item}><strong>引き渡し時期：</strong> 決済完了後、即時アカウントが発行され、通常24時間以内にご利用いただけます</p>
      <p className={styles.item}><strong>支払方法：</strong> クレジットカード（Visa / MasterCard / JCB / American Express）</p>
      <p className={styles.item}><strong>キャンセル・返金について：</strong> サービスの性質上、契約期間中の途中解約および返金には応じておりません。次回契約更新日の7日前までにご連絡いただければ、次回以降の課金を停止できます。</p>
      <p className={styles.item}><strong>サービス提供形態：</strong> 本サービスは法人・事業者向けに提供するクラウド型の車両管理SaaSです。ブラウザを通じてアクセス・利用が可能です。</p>

      <div className={styles.buttonWrapper}>
        <button
          onClick={() => router.push('/')}
          className={styles.backButton}
        >
          ← TOPページに戻る
        </button>
      </div>
    </div>
  )
}
