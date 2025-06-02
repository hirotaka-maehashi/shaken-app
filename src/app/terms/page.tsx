'use client'

import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>利用規約</h1>
      <p className={styles.item}>
        本利用規約（以下「本規約」）は、スター株式会社（以下「当社」）が提供するクラウド型車両管理サービス「shakenapp」（以下「本サービス」）に関する利用条件を定めるものです。
      </p>
      <p className={styles.item}><strong>1. 適用範囲：</strong><br /> 本規約は、本サービスの利用に関する一切の関係に適用されます。</p>
      <p className={styles.item}><strong>2. 利用登録：</strong><br /> 登録希望者が同意の上、当社所定の方法により利用登録を行い、当社が承認した時点で登録が完了します。</p>
      <p className={styles.item}><strong>3. 禁止事項：</strong><br /> 法令または公序良俗に違反する行為、他者への迷惑行為、虚偽情報の登録等を禁止します。</p>
      <p className={styles.item}><strong>4. 利用停止・登録抹消：</strong><br /> 規約違反がある場合、当社は予告なく利用停止または登録を抹消できるものとします。</p>
      <p className={styles.item}><strong>5. 免責事項：</strong><br /> 当社は、サービスの中断・停止・データ消失により生じた損害について、当社に故意または重大な過失がある場合を除き一切の責任を負いません。</p>
      <p className={styles.item}><strong>6. 準拠法・管轄：</strong><br /> 本規約は日本法に準拠し、本サービスに関する紛争は、名古屋地方裁判所を専属的合意管轄とします。</p>

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
