import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })


  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: '認証エラー（未ログイン）' }, { status: 401 })
  }

  const { token, companyName } = await req.json()
  const companyId = user.user_metadata?.company_id

  if (!token || !companyName || !companyId) {
    return NextResponse.json({ error: '入力または会社情報が不足しています' }, { status: 400 })
  }

  const { error } = await supabase.from('line_tokens').insert([
    {
      token,
      company_name: companyName,
      company_id: companyId,
      user_id: user.id,
    },
  ])

  if (error) {
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ message: '保存成功' })
}
