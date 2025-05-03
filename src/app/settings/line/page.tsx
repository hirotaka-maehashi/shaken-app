'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase-browser'  // ✅ ← Supabaseクライアント
import styles from './page.module.css'

export default function LineSettingPage() {
  const [token, setToken] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // 🔹トークン保存処理（APIを使わず直接保存）
  const handleSave = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user || error) {
      alert('❌ 未ログイン状態です')
      return
    }

    const companyId = user.user_metadata?.company_id
    if (!companyId) {
      alert('❌ company_id が取得できません')
      return
    }

    const { error: insertError } = await supabase.from('line_tokens').insert([
      {
        token,
        company_name: companyName,
        company_id: companyId,
        user_id: user.id,
      },
    ])

    if (insertError) {
      alert(`❌ 保存失敗: ${insertError.message}`)
    } else {
      setSaved(true)
    }
  }

  // 🔹LINEテスト送信処理（アクセストークンを明示的に送信）
  const handleTestSend = async () => {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    console.log('🔍 クライアントアクセストークン:', token) // ✅ ← 追加

    if (!token) {
      alert('❌ セッショントークンが取得できません。ログイン状態を確認してください。')
      return
    }

    const res = await fetch('/api/line/test-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ✅ トークンを明示的に送信
      },
      body: JSON.stringify({
        companyName,
        message: 'LINE連携テストメッセージです📲',
      }),
    })

    const result = await res.json()
    if (res.ok) {
      alert('✅ LINEに通知を送信しました！')
    } else {
      alert(`❌ 送信失敗: ${result.error || '不明なエラー'}`)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>LINE連携設定</h1>
      <p className={styles.description}>
        チャネルアクセストークンと法人名を入力してください。
      </p>

      <input
        type="text"
        placeholder="法人名を入力"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className={styles.input}
      />

      <input
        type="text"
        placeholder="チャネルアクセストークン"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className={styles.input}
      />

      <button onClick={handleSave} className={styles.button}>
        保存する
      </button>

      <button
        onClick={handleTestSend}
        className={styles.button}
        style={{ backgroundColor: '#28a745', marginTop: '10px' }}
      >
        LINEテスト送信
      </button>

      {saved && (
        <p className={styles.successMessage}>保存されました！</p>
      )}

      <button
        onClick={() => router.push('/dashboard')}
        className={styles.button}
        style={{ marginTop: '20px', backgroundColor: '#888' }}
      >
        ダッシュボードに戻る
      </button>
    </div>
  )
}
