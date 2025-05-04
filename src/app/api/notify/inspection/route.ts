import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase-server'

export const runtime = 'edge'

export async function GET() {
  const now = new Date()
  console.log("🚀 Vercel実行時刻（UTC）:", now.toISOString())

  const currentHour = now.getHours()

  // ⬇️ 環境ごとに制御（本番のみ9時制限）
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd && currentHour !== 9) {
    console.log('⏰ 通知対象外の時間です（現在: ' + currentHour + '時）')
    return NextResponse.json({ message: '通知時間外（本番のみ制限）' })
  }

  const today = new Date()
  const result: Record<string, unknown>[] = []

  // -------------------------------------
  // ✅ 1. 点検通知まとめ（vehicles）
  // -------------------------------------
  const { data: vehicles, error: vehicleError } = await supabase
    .from('vehicles')
    .select(`id, number_plate, car_model, inspection_date, company_id, branch_name, color,
             last_oil_change_date, last_element_change_date, last_tire_change_date, last_battery_change_date`)

  if (vehicleError) {
    console.error('❌ 車両データ取得エラー:', vehicleError)
  } else {
    vehicles.forEach(vehicle => {
      const checks = [
        { type: '車検', baseDate: vehicle.inspection_date, offsetDays: 0 },
        { type: 'オイル交換', baseDate: vehicle.last_oil_change_date, offsetDays: 180 },
        { type: 'エレメント交換', baseDate: vehicle.last_element_change_date, offsetDays: 180 },
        { type: 'タイヤ交換', baseDate: vehicle.last_tire_change_date, offsetDays: 1095 },
        { type: 'バッテリー交換', baseDate: vehicle.last_battery_change_date, offsetDays: 1095 },
      ]

      checks.forEach(check => {
        if (!check.baseDate) return
        const base = new Date(check.baseDate)
        base.setDate(base.getDate() + check.offsetDays)
        const diff = Math.ceil((base.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        let stage: 'urgent' | 'warning' | 'info' | null = null
        if (diff <= 7) stage = 'urgent'
        else if (diff <= 30) stage = 'warning'
        else if (diff <= 60) stage = 'info'
        
        if (stage) {
          result.push({
            ...vehicle,
            diffDays: diff,
            stage,  // ✅ エラーにならない
            type: check.type,
            target_date: base.toISOString().split('T')[0],
          })
        }
      })
    })
  }

// -------------------------------------
// ✅ 2. 法定点検通知（maintenance_schedule）
// -------------------------------------

const { data: maintenance, error: maintError } = await supabase
  .from('maintenance_schedule')
  .select('vehicle_id, type, next_due_date')

if (maintError) {
  console.error('❌ 法定点検データ取得エラー:', maintError)
} else {
  for (const record of maintenance) {
    if (!record.next_due_date) continue

    const dueDate = new Date(record.next_due_date)
    const diffDays = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    // ✅ 型を明示する（null含むが後でチェックあり）
    let stage: 'urgent' | 'warning' | 'info' | null = null
    if (diffDays <= 7) stage = 'urgent'
    else if (diffDays <= 30) stage = 'warning'
    else if (diffDays <= 60) stage = 'info'

    // ❗ nullは通知対象外としてスキップ
    if (!stage) continue

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select('number_plate, car_model, color, branch_name, company_id')
      .eq('id', record.vehicle_id)
      .single()

    if (!error && vehicle) {
      result.push({
        ...vehicle,
        diffDays,
        stage, // ✅ TypeScriptでもOK
        type: record.type || '法定点検',
        target_date: record.next_due_date,
      })
    }
  }
}

// ✅ 通知送信
for (const item of result) {
  const { data: tokenRow } = await supabase
    .from('line_tokens')
    .select('token')
    .eq('company_id', item.company_id)
    .single()

  if (!tokenRow?.token) {
    console.warn('⚠️ トークン未取得 company_id:', item.company_id)
    continue
  }

  const message = `[${item.type} - ${item.stage}]
${item.branch_name || '拠点不明'}の車両
「${item.number_plate}（${item.car_model} / ${item.color}）」は
${item.target_date}が期限です（残り${item.diffDays}日）`

  const lineRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenRow.token}`,
    },
    body: JSON.stringify({
      messages: [{ type: 'text', text: message }],
    }),
  })

  if (lineRes.ok) {
    console.log('✅ 通知送信済:', message)
  } else {
    console.error('❌ LINE送信失敗:', await lineRes.text())
  }
}
};  