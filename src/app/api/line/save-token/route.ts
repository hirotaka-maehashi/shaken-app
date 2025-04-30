import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase' // データベース保存用

export async function POST(req: NextRequest) {
  const { token, companyName } = await req.json()

  if (!token || !companyName) {
    return NextResponse.json({ error: 'トークンか法人名がありません' }, { status: 400 })
  }

  // トークンを保存
  const { error } = await supabase.from('line_tokens').insert([
    {
      token,
      company_name: companyName,
    },
  ])

  if (error) {
    console.error('保存エラー:', error.message)
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ message: '保存成功' })
}
