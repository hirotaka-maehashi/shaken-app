// src/app/page.tsx
'use client' // ←これが必須！！！

import styles from './page.module.css'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { BanknotesIcon } from '@heroicons/react/24/outline'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { BuildingOfficeIcon, CubeIcon } from '@heroicons/react/24/outline'
import {
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  InboxStackIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
   
  return (
    <div className={styles.wrapper}>
      {/* ヘッダー */}
      <header className={styles.header}>
  <div className={styles.wrapper}>
  <Image
  src="/logo/logo.png"
  alt="車検くんロゴ"
  width={160}
  height={40}
  className={styles.logoMain}
/>
    <nav className={styles.nav}>
  <div className={styles.navLinks}>
    <a href="#features">特徴</a>
    <a href="#plans">料金</a>
    <a href="#steps">導入ステップ</a>
    <a href="#faq">FAQ</a>
  </div>
  <div className={styles.navButtons}>
  <button
    onClick={async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push('/dashboard') // ログイン済みならダッシュボード
      } else {
        router.push('/signup?mode=trial') // 未ログインならトライアル登録へ
      }
    }}
    className={styles.ctaButton}
  >
    無料で試す
  </button>
  <a href="#plans" className={styles.ctaButtonSecondary}>プランを見る</a>
</div>
</nav>

  </div>
</header>

      {/* ヒーローセクション（ビジュアル強化版） */}
      <section className={styles.hero}>
  <div className={styles.wrapper}>
    <div className={styles.heroContent}>
      <p className={styles.heroLabel}>車両管理でこんなお悩みありませんか？</p>
      <h1 className={styles.catch}>
        車検・点検・整備も、<br />これ一つで管理完了。
      </h1>
      <p className={styles.subtext}>
        属人化・見落とし・コストのムダを徹底排除。<br />
        車両管理の“悩み”から解放される時代へ。
      </p>
      <div className={styles.buttons}>
        <a href="/signup?mode=trial" className={styles.trialButton}>14日間無料で試す</a>
        <a href="/plans?mode=entry" className={styles.buyButton}>今すぐ導入する</a>
      </div>
    </div>
    <div className={styles.heroImage}>
  <Image
    src="/images/dashboard-ui.png"
    alt="車検くんUIイメージ"
    width={600}  // 適宜調整
    height={400} // 適宜調整
    className={styles.heroImage}
  />
</div>
  </div>
</section>

      {/* 課題提起セクション（KARTE風リスタイル） */}
      <section className={styles.problemSection}>
  <div className={styles.wrapper}>
    <h2 className={styles.problemTitle} style={{ fontSize: '28px', marginBottom: '24px' }}>
      こんな誤解やお悩み、3〜4個以上当てはまる方は…
    </h2>

    <div className={styles.problemGrid}>
      <div className={styles.problemCard}>
        <ShieldCheckIcon className={styles.cardIcon} />
        任せているから大丈夫と思っている
      </div>
      <div className={styles.problemCard}>
        <ClipboardDocumentCheckIcon className={styles.cardIcon} />
        台帳に記録していれば安心だと思っている
      </div>
      <div className={styles.problemCard}>
        <UserGroupIcon className={styles.cardIcon} />
        担当者任せで把握をできていない
      </div>
      <div className={styles.problemCard}>
        <InboxStackIcon className={styles.cardIcon} />
        一括リースだから管理不要だと思っている
      </div>
      <div className={styles.problemCard}>
        <DocumentTextIcon className={styles.cardIcon} />
        整備記録は紙で十分だと思っている
      </div>
      <div className={styles.problemCard}>
        <ChartBarIcon className={styles.cardIcon} />
        点検後の結果が共有されずに終わっている
      </div>
      <div className={styles.problemCard}>
        <EyeSlashIcon className={styles.cardIcon} />
        数字で全体像を把握していない
      </div>
      <div className={styles.problemCard}>
        <ArrowTrendingUpIcon className={styles.cardIcon} />
        経年劣化によるコスト上昇に気づいてない
      </div>
    </div>

    <p className={styles.problemLead}>
      <strong style={{ color: '#0070f3' }}>1台あたり100万円以上</strong> の余計なコストが、<br />
      <span style={{ fontWeight: '600', color: '#333' }}>
        知らないうちに発生しているかもしれません。
      </span>
    </p>
  </div>
</section>

      {/* 無料プレゼントセクション（新設） */}
      <section className={styles.bonusSection}>
  <div className={styles.wrapper}>
    <h2 className={styles.bonusTitle}>無料で受け取れる導入判断資料</h2>
    <ul className={styles.bonusList}>
      <li>
        <DocumentTextIcon className={styles.icon} />
        <span className={styles.bonusText}>リース vs 新車 vs 中古車 運用比較表（PDF）</span>
      </li>
      <li>
        <ChartBarIcon className={styles.icon} />
        <span className={styles.bonusText}>リースのメリット・デメリット早見表</span>
      </li>
      <li>
        <BanknotesIcon className={styles.icon} />
        <span className={styles.bonusText}>車両管理にかかるコスト目安表</span>
      </li>
    </ul>
    <a href="/gift" className={styles.downloadButton}>
  <ArrowDownTrayIcon className={styles.downloadIcon} />
  無料資料を受け取る
</a>
  </div>
</section>

      {/* 特徴セクション */}
      <section className={styles.features}>
  <h2>車検くんでこんな未来が手に入ります</h2>
  <div className={styles.featureList}>
    <div className={styles.feature}>
      <CheckCircleIcon className={styles.checkIcon} />
      <h3>管理の不安がゼロに</h3>
      <p>誰が見ても一目で状況が分かるから<br />属人化がなくなる</p>
    </div>
    <div className={styles.feature}>
      <CheckCircleIcon className={styles.checkIcon} />
      <h3>次の車検がすぐ分かる</h3>
      <p>全車両の車検日が並び<br />優先順位が明確に</p>
    </div>
    <div className={styles.feature}>
      <CheckCircleIcon className={styles.checkIcon} />
      <h3>点検も写真で確認</h3>
      <p>現場からスマホで撮影 <br />→ 本部で即確認。二重手間も削減</p>
    </div>
    <div className={styles.feature}>
      <CheckCircleIcon className={styles.checkIcon} />
      <h3>リースか自社保有か、数値で判断</h3>
      <p>運用コストの比較表で<br />経営判断をスムーズに</p>
    </div>
    <div className={styles.feature}>
      <CheckCircleIcon className={styles.checkIcon} />
      <h3>本社報告が30秒で完了</h3>
      <p>PDF出力＆CSVダウンロードで<br />提出資料が一瞬で整う</p>
    </div>
    <div className={styles.feature}>
      <CheckCircleIcon className={styles.checkIcon} />
      <h3>支店ごとの台数も一覧表示</h3>
      <p>支店別・担当者別の絞り込みも<br />可能。抜け漏れチェックに便利</p>
    </div>
    <div className={styles.feature}>
      <CheckCircleIcon className={styles.checkIcon} />
      <h3>コストが見えるから<br />節約に繋がる</h3>
      <p>保険・整備・維持費の履歴から<br />無駄を削減</p>
    </div>
    <div className={styles.feature}>
      <CheckCircleIcon className={styles.checkIcon} />
      <h3>スマホ1台ですべて完結</h3>
      <p>現場でも、オフィスでも<br />PCが苦手な方でも安心</p>
    </div>
  </div>
</section>

{/* 導入企業の事例と実績 */}
<section className={styles.caseSection}>
  <div className={styles.wrapper}>
    <h2 className={styles.caseTitle}>導入企業の事例と実績</h2>
    <div className={styles.caseList}>
      <div className={styles.caseCard}>
        <div className={styles.caseTitleRow}>
          <BuildingOfficeIcon className={styles.caseIcon} />
          <h3>導入事例① グループ企業様</h3>
        </div>
        <p>  点検報告の紙管理を完全廃止。スマホから現場ごとに点検結果をリアルタイム報告できるようになり、記録ミス・伝達漏れがゼロに。月次レポートも自動集計されるため、報告書作成のために残業していた時間が1/2に短縮。現場社員からは「とにかくラクになった」「もう紙に戻れない」との声も。</p>
      </div>
      <div className={styles.caseCard}>
        <div className={styles.caseTitleRow}>
          <CubeIcon className={styles.caseIcon} />
          <h3>導入事例② 営業B社</h3>
        </div>
        <p>30台超の社用車の管理をデジタル化。車検や点検のタイミングを一覧で把握できるようになり、担当者の確認作業時間が1日1時間から15分に。ドライバーごとにLINE通知が届く設定を導入し、予定忘れやダブルブッキングも解消。導入初月から整備業者との連携もスムーズに。</p>
      </div>
      <div className={styles.caseCard}>
        <div className={styles.caseTitleRow}>
          <UserGroupIcon className={styles.caseIcon} />
          <h3>導入事業③ 介護C社</h3>
        </div>
        <p>5拠点にまたがる車両の使用履歴と整備情報を一元管理。以前はExcelで各拠点が別々に管理していたが、クラウド化により本部から全体の稼働状況をリアルタイムで把握可能に。点検時の報告業務もスマホ入力で完了するようになり、職員のIT負荷も軽減。年間200時間以上の業務削減に繋がった。</p>
      </div>
    </div>
  </div>
</section>

      {/* 導入ステップ */}
      <section className={styles.stepSection}>
  <div className={styles.wrapper}>
    <h2 className={styles.stepTitle}>
      導入までのステップ <span>（今だけ10社限定）</span>
    </h2>
    <p className={styles.stepSubtitle}>
  リリース記念として、今だけ
  <span className={styles.red}>先着10社限定</span>
  で無料トライアル実施中！
</p>

    <div className={styles.steps}>
      <div className={styles.stepBox}>
        <div className={styles.stepNumber}>STEP 1</div>
        <p>法人情報を入力して無料登録（所要1分）</p>
      </div>
      <div className={styles.stepBox}>
        <div className={styles.stepNumber}>STEP 2</div>
        <p>管理車両の登録 or CSVで一括取込</p>
      </div>
      <div className={styles.stepBox}>
        <div className={styles.stepNumber}>STEP 3</div>
        <p>即日で車検開始・自動通知も有効に！</p>
      </div>
    </div>

    <p className={styles.cta}>
      詳しく話を聞きたい方は{' '}
      <a href="#" className={styles.ctaLink}>無料Zoom相談（30分）</a> にご登録ください。
    </p>
  </div>
</section>

      {/* 最終CTAセクション */}
      <section className={styles.finalCta}>
        <h2>まずは1台から、車両管理をスマートに。</h2>
        <p>無料トライアルは今だけ先着10社限定です。お早めに。</p>
        <div className={styles.buttons}>
          <a href="/signup?mode=trial" className={styles.trialButton}>無料トライアルを開始する</a>
          <a href="/plans?mode=entry" className={styles.buyButton}>プランを確認する</a>
        </div>
      </section>

      {/* よくある質問 */}
      <section className={styles.faqSection}>
  <h2>よくある質問</h2>

  <div className={styles.faqItem}>
    <p className={styles.question}>Q. どのくらいの台数から利用できますか？</p>
    <p className={styles.answer}>A. 1台からOKです。台数に応じて最適化されます。</p>
  </div>

  <div className={styles.faqItem}>
    <p className={styles.question}>Q. トライアル後に自動課金されますか？</p>
    <p className={styles.answer}>A. いいえ。プランを選ぶまでは課金されません。</p>
  </div>

  <div className={styles.faqItem}>
    <p className={styles.question}>Q. 複数の担当者で同時に使えますか？</p>
    <p className={styles.answer}>A. はい。同一法人内で複数アカウントを連携し、役割別に管理可能です。</p>
  </div>

  <div className={styles.faqItem}>
    <p className={styles.question}>Q. スマホからも使えますか？</p>
    <p className={styles.answer}>A. はい。レスポンシブ対応でスマホでも快適に使えます。</p>
  </div>

  <div className={styles.faqItem}>
    <p className={styles.question}>Q.通知はLINE以外にもできますか？</p>
    <p className={styles.answer}>A.  はい。Slackやメール通知にも対応予定です（プランにより異なります）。</p>
  </div>

  <div className={styles.faqItem}>
    <p className={styles.question}>Q.  他社製品との違いは何ですか？</p>
    <p className={styles.answer}>A. 1台あたり1,100円（税込）からと、中小企業で導入しやすい体制を敷いてます。</p>
  </div>
</section>



      {/* フッター */}
<footer className={styles.footer}>
  <p>© 2025 車検くん</p>
  <ul className={styles.footerLinks}>
    <li><a href="/terms">利用規約</a></li>
    <li><a href="/privacy">プライバシーポリシー</a></li>
    <li><a href="/tokushoho">特定商取引法に基づく表記</a></li>
    <li><a href="/contact">お問い合わせ</a></li>
  </ul>
</footer>
    </div>
  )
}
