import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ ← ここが効いていなかった！
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log('✅ user:', user)
  console.log('✅ error:', error)

  if (!user) {
    return NextResponse.json({ error: '未認証です' }, { status: 401 })
  }

  return NextResponse.json({ message: '成功', user })
}