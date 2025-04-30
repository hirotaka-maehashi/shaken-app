import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase-server'

export async function POST(req: NextRequest) {
  const { companyName, message } = await req.json()
  const trimmedName = companyName.trim()

  console.log('✅ 受け取った companyName:', trimmedName)
  console.log('✅ 受け取った message:', message)

  // 🔍 全レコード取得して一致確認用に出力
  const { data: allTokens, error: allError } = await supabase
    .from('line_tokens')
    .select('*')

  if (allError) {
    console.error('❌ 全件取得エラー:', allError)
  } else {
    console.log('📋 line_tokens の全データ:', allTokens)

    const matches = allTokens.filter(row => row.company_name === trimmedName)
    console.log('🔍 完全一致した件数:', matches.length)
    if (matches.length > 0) {
      console.log('✅ 一致したレコード:', matches[0])
    }
  }

  // 🔁 通常の取得処理（まだ止めない）
  const { data, error } = await supabase
    .from('line_tokens')
    .select('token')
    .eq('company_name', trimmedName)
    .single()

  console.log('✅ Supabaseから取得したデータ:', data)
  console.log('⛔ Supabaseエラー（あれば）:', error)

  if (error || !data?.token) {
    return NextResponse.json({ error: 'トークン取得失敗' }, { status: 404 })
  }

  // 通知処理（省略せずにそのまま）
  const lineRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
    },
    body: JSON.stringify({
      messages: [{ type: 'text', text: message }],
    }),
  })

  if (!lineRes.ok) {
    const errorText = await lineRes.text()
    return NextResponse.json({ error: 'LINE送信失敗', detail: errorText }, { status: 500 })
  }

  return NextResponse.json({ message: 'LINE送信成功！' })
}
