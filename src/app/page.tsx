'use client'

export default function Home() {
  return (
    <main style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>🚗 車検管理アプリ「車検くん」</h1>
      <p style={{ marginBottom: '40px', fontSize: '16px', lineHeight: 1.6 }}>
        このアプリでは、社用車の車検情報を管理できます。<br />
        登録・確認・一覧表示まで、すべてここで完結！
      </p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/vehicles">
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            ＋ 車両を登録する
          </button>
        </a>
        <a href="/vehicles/list">
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#eaeaea',
            color: '#000',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}>
            📋 登録一覧を見る
          </button>
        </a>
      </div>
    </main>
  )
}