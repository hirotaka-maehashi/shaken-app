'use client'

import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>プライバシーポリシー</h1>
      <p className={styles.item}>
        スター株式会社（以下「当社」といいます）は、当社が提供するサービス（shakenapp）において、利用者の個人情報を適切に取り扱うことを社会的責務と認識し、以下の方針に従い、個人情報の保護に努めます。
      </p>
      <p className={styles.item}><strong>1. 個人情報の取得について：</strong><br /> 当社は、利用者からの登録情報・お問い合わせ内容等により、氏名、メールアドレス、会社情報等の個人情報を取得する場合があります。</p>
      <p className={styles.item}><strong>2. 利用目的：</strong><br /> サービスの提供、本人確認、利用料金の請求、問い合わせ対応、法令遵守対応などの目的で使用します。</p>
      <p className={styles.item}><strong>3. 第三者提供：</strong><br /> 法令に基づく場合を除き、利用者の同意なく第三者に提供することはありません。</p>
      <p className={styles.item}><strong>4. 管理体制：</strong><br /> 個人情報への不正アクセス・漏えい・改ざん等を防止するため、必要かつ適切な管理体制を構築します。</p>
      <p className={styles.item}><strong>5. お問い合わせ：</strong><br /> 本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。<br /> starcorporation2024@gmail.com</p>

      <div className={styles.backButtonWrapper}>
        <button onClick={() => router.push('/dashboard')} className={styles.backButton}>
          ← ダッシュボードに戻る
        </button>
      </div>
    </div>
  )
}
