'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase-browser'
import styles from './page.module.css'
import Link from 'next/link'
import {ArrowLeft,PlusCircle,} from 'lucide-react'


type Vehicle = {
  id: string
  company_id: string 
  number_plate: string
  car_model: string
  color: string
  branch_name: string
  garage_address: string
  inspection_date: string
  notification_type: string
  next_due_date?: string | null
  last_oil_change_date?: string | null
  last_element_change_date?: string | null
  last_tire_change_date?: string | null
  last_battery_change_date?: string | null
  line_group_id?: string | null
note?: string | null
}

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<string[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
const [editFormData, setEditFormData] = useState({
  branch_name: '',
  number_plate: '',
  car_model: '',
  color: '',
  inspection_date: '',
  garage_address: '',
  notification_type: '',
  line_group_id: '',
  note: '',
  maintenance_type: '',
  next_due_date: '',
  last_oil_change_date: '',
  last_element_change_date: '',
  last_tire_change_date: '',
  last_battery_change_date: '',
  maintenance_note: '',
})

const [openVehicleId, setOpenVehicleId] = useState<string | null>(null)
const toggleVehicleDetail = (vehicleId: string) => {
  setOpenVehicleId(prevId => (prevId === vehicleId ? null : vehicleId))
}
const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
const [isInspectionEditModalOpen, setIsInspectionEditModalOpen] = useState(false)
const [newInspectionDate, setNewInspectionDate] = useState('')

const [editMode, setEditMode] = useState<'inspection' | 'nextInspection'>('inspection')


const openInspectionEditModal = (vehicle: Vehicle) => {
  setSelectedVehicle(vehicle)
  setNewInspectionDate(vehicle.inspection_date || '')
  setEditMode('inspection') // ✅車検だから inspection
  setIsInspectionEditModalOpen(true)
}

const openNextInspectionEditModal = (vehicle: Vehicle) => {
  setSelectedVehicle(vehicle)
  setNewInspectionDate(vehicle.next_due_date || '')
  setEditMode('nextInspection') // ✅法定点検だから nextInspection
  setIsInspectionEditModalOpen(true)
}

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const companyId = userData?.user?.user_metadata?.company_id
      if (!companyId) return
  
      // 子会社も含めて取得する処理を追加
      const { data: subsidiaries } = await supabase
        .from('companies')
        .select('id')
        .eq('parent_company_id', companyId)
  
      const companyIds = [companyId, ...(subsidiaries?.map(s => s.id) || [])]
  
      // 車両データをまとめて取得（親会社＋子会社）
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .in('company_id', companyIds)
        .order('inspection_date', { ascending: true })
  
      // メンテナンススケジュールもまとめて取得（親会社＋子会社）
      const { data: maintenanceData } = await supabase
        .from('maintenance_schedule')
        .select('*')
        .in('company_id', companyIds)
  
      if (!vehicleError && vehicleData && maintenanceData) {
        const mergedVehicles = vehicleData.map(vehicle => {
          const maintenance = maintenanceData.find(m => m.vehicle_id === vehicle.id)
          return {
            ...vehicle,
            next_due_date: maintenance?.next_due_date || null,
          }
        })
  
        setVehicles(mergedVehicles)
  
        const uniqueBranches = Array.from(new Set(mergedVehicles.map((v) => v.branch_name)))
        setBranches(uniqueBranches)
      }
  
      setLoading(false)
    }
  
    fetchVehicles()
  }, [])  //

  const handleDelete = async (vehicleId: string, companyId: string) => {
    const confirmDelete = window.confirm('この車両を削除してもよろしいですか？')
    if (!confirmDelete) return
  
    // ① 車両を削除
    const { error: vehicleDeleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
  
    if (vehicleDeleteError) {
      console.error('削除エラー:', vehicleDeleteError.message)
      alert('車両削除に失敗しました: ' + vehicleDeleteError.message)
      return
    }
  
    // ② 削除後、同じcompany_idに紐づく残りの車両台数を確認
    const { data: remainingVehicles, error: fetchError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('company_id', companyId)
  
    if (fetchError) {
      console.error('台数確認エラー:', fetchError.message)
      alert('台数確認に失敗しました: ' + fetchError.message)
      return
    }
  
    // ③ 残り台数が0なら、companyも削除
    if (remainingVehicles.length === 0) {
      const { error: companyDeleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)

        console.log('残りの車両台数:', remainingVehicles?.length) // ←ここに追加！
  
      if (companyDeleteError) {
        console.error('会社削除エラー:', companyDeleteError.message)
        alert('会社情報の削除に失敗しました: ' + companyDeleteError.message)
        return
      }
    }
  
    alert('削除が完了しました！')
    location.reload()
  }  

  const [companies, setCompanies] = useState<{ id: string; name: string; parent_company_id?: string | null }[]>([])

useEffect(() => {
  const fetchCompanies = async () => {
    const { data, error } = await supabase.from('companies').select('id, name, parent_company_id')
    if (!error && data) {
      setCompanies(data)
    }
  }
  fetchCompanies()
}, [])

const [displayMode, setDisplayMode] = useState('all') // company または branch を切り替え
const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())
const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set())


const handleOilChangeComplete = async (vehicleId: string) => {
  const confirmUpdate = window.confirm('6ヶ月後にオイル交換予定日が更新されますが、よろしいですか？')
  if (!confirmUpdate) return

  const today = new Date()
  const nextOilChangeDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())
  const formattedDate = nextOilChangeDate.toISOString().split('T')[0]

  const { error } = await supabase
    .from('vehicles')
    .update({ last_oil_change_date: formattedDate })
    .eq('id', vehicleId)

  if (error) {
    alert('オイル交換日の更新に失敗しました: ' + error.message)
  } else {
    alert('オイル交換日を更新しました！')
    location.reload()
  }
}

const handleElementChangeComplete = async (vehicleId: string) => {
  const confirmUpdate = window.confirm('6ヶ月後にエレメント交換予定日が更新されますが、よろしいですか？')
  if (!confirmUpdate) return

  const today = new Date()
  const nextElementChangeDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())
  const formattedDate = nextElementChangeDate.toISOString().split('T')[0]

  const { error } = await supabase
    .from('vehicles')
    .update({ last_element_change_date: formattedDate })
    .eq('id', vehicleId)

  if (error) {
    alert('エレメント交換日の更新に失敗しました: ' + error.message)
  } else {
    alert('エレメント交換日を更新しました！')
    location.reload()
  }
}

const handleTireChangeComplete = async (vehicleId: string) => {
  const confirmUpdate = window.confirm('3年後にタイヤ交換予定日が更新されますが、よろしいですか？')
  if (!confirmUpdate) return

  const today = new Date()
  const nextTireChangeDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
  const formattedDate = nextTireChangeDate.toISOString().split('T')[0]

  const { error } = await supabase
    .from('vehicles')
    .update({ last_tire_change_date: formattedDate })
    .eq('id', vehicleId)

  if (error) {
    alert('タイヤ交換日の更新に失敗しました: ' + error.message)
  } else {
    alert('タイヤ交換日を更新しました！')
    location.reload()
  }
}

const handleBatteryChangeComplete = async (vehicleId: string) => {
  const confirmUpdate = window.confirm('3年後にバッテリー交換予定日が更新されますが、よろしいですか？')
  if (!confirmUpdate) return

  const today = new Date()
  const nextBatteryChangeDate = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate())
  const formattedDate = nextBatteryChangeDate.toISOString().split('T')[0]

  const { error } = await supabase
    .from('vehicles')
    .update({ last_battery_change_date: formattedDate })
    .eq('id', vehicleId)

  if (error) {
    alert('バッテリー交換日の更新に失敗しました: ' + error.message)
  } else {
    alert('バッテリー交換日を更新しました！')
    location.reload()
  }
}

const openEditModal = async (vehicle: Vehicle) => {
  setEditVehicle(vehicle)

  // maintenance_scheduleからデータも取得
  const { data: maintenanceData } = await supabase
  .from('maintenance_schedule')
  .select('type, next_due_date, note') // ← サーバー側の正しいカラム名に修正
  .eq('vehicle_id', vehicle.id)
  .single()

  setEditFormData({
    branch_name: vehicle.branch_name || '',
    number_plate: vehicle.number_plate || '',
    car_model: vehicle.car_model || '',
    color: vehicle.color || '',
    inspection_date: vehicle.inspection_date || '',
    garage_address: vehicle.garage_address || '',
    notification_type: vehicle.notification_type || '',
    line_group_id: vehicle.line_group_id || '',
    note: vehicle.note || '',
    maintenance_type: maintenanceData?.type || '',  // ← typeを参照
    maintenance_note: maintenanceData?.note || '',
    next_due_date: maintenanceData?.next_due_date || '',
    last_oil_change_date: vehicle.last_oil_change_date || '',
    last_element_change_date: vehicle.last_element_change_date || '',
    last_tire_change_date: vehicle.last_tire_change_date || '',
    last_battery_change_date: vehicle.last_battery_change_date || '',
  })

  setIsEditModalOpen(true)
}

const handleSaveEdit = async () => {
  if (!editVehicle) return

  // ① vehiclesテーブルの更新
  const { error: vehicleError } = await supabase
    .from('vehicles')
    .update({
      branch_name: editFormData.branch_name,
      number_plate: editFormData.number_plate,
      car_model: editFormData.car_model,
      color: editFormData.color,
      inspection_date: editFormData.inspection_date,
      garage_address: editFormData.garage_address,
      notification_type: editFormData.notification_type,
      line_group_id: editFormData.line_group_id,
      note: editFormData.note,
      last_oil_change_date: editFormData.last_oil_change_date,
      last_element_change_date: editFormData.last_element_change_date,
      last_tire_change_date: editFormData.last_tire_change_date,
      last_battery_change_date: editFormData.last_battery_change_date,
    })
    .eq('id', editVehicle.id)

  // ② maintenance_scheduleテーブルの更新
  const { error: maintenanceError } = await supabase
    .from('maintenance_schedule')
    .update({
      next_due_date: editFormData.next_due_date,
    })
    .eq('vehicle_id', editVehicle.id)

  // ③ エラーハンドリング
  if (vehicleError || maintenanceError) {
    alert('更新に失敗しました: ' + (vehicleError?.message || maintenanceError?.message))
  } else {
    alert('更新が完了しました！')
    setIsEditModalOpen(false)
    location.reload()
  }
}

const filteredVehicles = vehicles.filter((v) => {
  if (displayMode === 'company') {
    return selectedCompanies.has(v.company_id)  // ← size === 0を削除！
  } else if (displayMode === 'branch') {
    return selectedBranches.has(v.branch_name)  // ← size === 0を削除！
  } else {

    return true // allの場合はすべて表示
  }
})

const handleInspectionDateSave = async () => {
  if (!selectedVehicle) return

  const { error } = await supabase
    .from('vehicles')
    .update({ inspection_date: newInspectionDate })
    .eq('id', selectedVehicle.id)

  if (error) {
    alert('更新に失敗しました: ' + error.message)
  } else {
    alert('車検情報を更新しました！')
    setIsInspectionEditModalOpen(false)
    location.reload()
  }
}

const handleNextInspectionDateSave = async () => {
  if (!selectedVehicle) return

  console.log('保存する日付:', newInspectionDate) 

  const { error } = await supabase
    .from('maintenance_schedule')
    .update({ next_due_date: newInspectionDate })
    .eq('vehicle_id', selectedVehicle.id)

  if (error) {
    console.error('保存エラー:', error)
    alert('法定点検情報の更新に失敗しました: ' + error.message)
  } else {
    alert('法定点検情報を更新しました！')
    setIsInspectionEditModalOpen(false)
    location.reload()
  }
}

return (
  <div className={styles.container}>

{/* モーダル */}
{isEditModalOpen && editVehicle && (
  <div className={styles.modalOverlay}>
<div className={styles.modalContent}>
  <h2>登録車両情報を編集する</h2>
  <input type="text" value={editFormData.branch_name} onChange={(e) => setEditFormData({ ...editFormData, branch_name: e.target.value })} placeholder="営業所・拠点名" className={styles.inputField} />
  <input type="text" value={editFormData.number_plate} onChange={(e) => setEditFormData({ ...editFormData, number_plate: e.target.value })} placeholder="ナンバー" className={styles.inputField} />
  <input type="text" value={editFormData.car_model} onChange={(e) => setEditFormData({ ...editFormData, car_model: e.target.value })} placeholder="車種" className={styles.inputField} />
  <input type="text" value={editFormData.color} onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })} placeholder="色" className={styles.inputField} />
  <label className={styles.inputLabel}>車検期限</label>
  <input type="date" value={editFormData.inspection_date} onChange={(e) => setEditFormData({ ...editFormData, inspection_date: e.target.value })} className={styles.inputField} />
  <input type="text" value={editFormData.garage_address} onChange={(e) => setEditFormData({ ...editFormData, garage_address: e.target.value })} placeholder="使用場所" className={styles.inputField} />

  <select value={editFormData.notification_type} onChange={(e) => setEditFormData({ ...editFormData, notification_type: e.target.value })} className={styles.inputField}>
    <option value="">通知方法を選択</option>
    <option value="group">LINEグループ通知</option>
    <option value="individual">担当者通知</option>
  </select>

  <input type="text" value={editFormData.line_group_id} onChange={(e) => setEditFormData({ ...editFormData, line_group_id: e.target.value })} placeholder="LINEグループID" className={styles.inputField} />
  <textarea value={editFormData.note} onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })} placeholder="備考" className={styles.inputField} />
  <input type="text" value={editFormData.maintenance_type} onChange={(e) => setEditFormData({ ...editFormData, maintenance_type: e.target.value })} placeholder="整備種別" className={styles.inputField} />
  <label className={styles.inputLabel}>法定点検最終日</label>
  <input type="date" value={editFormData.next_due_date} onChange={(e) => setEditFormData({ ...editFormData, next_due_date: e.target.value })} className={styles.inputField} />
  <label className={styles.inputLabel}>オイル交換最終日</label>
  <input type="date" value={editFormData.last_oil_change_date} onChange={(e) => setEditFormData({ ...editFormData, last_oil_change_date: e.target.value })} className={styles.inputField} />
  <label className={styles.inputLabel}>エレメント交換最終日</label>
  <input type="date" value={editFormData.last_element_change_date} onChange={(e) => setEditFormData({ ...editFormData, last_element_change_date: e.target.value })} className={styles.inputField} />
  <label className={styles.inputLabel}>タイヤ交換最終日</label>
  <input type="date" value={editFormData.last_tire_change_date} onChange={(e) => setEditFormData({ ...editFormData, last_tire_change_date: e.target.value })} className={styles.inputField} />
  <label className={styles.inputLabel}>バッテリー交換最終日</label>
  <input type="date" value={editFormData.last_battery_change_date} onChange={(e) => setEditFormData({ ...editFormData, last_battery_change_date: e.target.value })} className={styles.inputField} />
  <textarea value={editFormData.maintenance_note} onChange={(e) => setEditFormData({ ...editFormData, maintenance_note: e.target.value })} placeholder="整備メモ" className={styles.inputField} />
  <div className={styles.modalButtons}>
  <button onClick={handleSaveEdit} className={styles.saveButton}>
    保存する
  </button>
  <button onClick={() => setIsEditModalOpen(false)} className={styles.cancelButton}>
    戻る
  </button>
</div>
</div>

  </div>
)}

{isInspectionEditModalOpen && selectedVehicle && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
    <h2>{editMode === 'inspection' ? '車検情報を更新する' : '法定点検情報を更新する'}</h2>
      <input
        type="date"
        value={newInspectionDate}
        onChange={(e) => setNewInspectionDate(e.target.value)}
        className={styles.inputField}
      />
      <div className={styles.modalButtons}>
      {editMode === 'inspection' ? (
  <button onClick={handleInspectionDateSave} className={styles.saveButton}>
    保存する
  </button>
) : (
  <button onClick={handleNextInspectionDateSave} className={styles.saveButton}>
    保存する
  </button>
)}
        <button onClick={() => setIsInspectionEditModalOpen(false)} className={styles.cancelButton}>
          キャンセル
        </button>
      </div>
    </div>
  </div>
)}

    {/* ページヘッダー */}
    <div className={styles.pageHeader}>
      <h1 className={styles.heading}>車両一覧</h1>
    </div>

    {/* フィルターエリア（会社・拠点） */}
    {companies.length > 0 && (
      <div className={styles.filterArea}>
        <h3>表示モード：</h3>
        <select
          className={styles.selectBox}
          value={displayMode}
          onChange={(e) => setDisplayMode(e.target.value)}
        >
          <option value="all">すべて表示</option>
          <option value="company">会社ごとに表示</option>
          <option value="branch">拠点ごとに表示</option>
        </select>
      </div>
    )}

{displayMode === 'company' && companies.length > 0 && (
  <div className={styles.filterArea}>
    {/* 会社チェックボックス */}
    {companies.map((company) => (
      <label key={company.id} className={styles.branchToggle}>
        <input
          type="checkbox"
          checked={selectedCompanies.has(company.id)}
          onChange={() => {
            const newSet = new Set(selectedCompanies)
            if (newSet.has(company.id)) {
              newSet.delete(company.id)
            } else {
              newSet.add(company.id)
            }
            setSelectedCompanies(newSet)
          }}
        />
        {company.name}
      </label>
    ))}
  </div>
)}


{displayMode === 'branch' && branches.length > 0 && (
  <div className={styles.filterArea}>
    {/* 拠点チェックボックス */}
    {branches.map((branch) => (
      <label key={branch} className={styles.branchToggle}>
        <input
          type="checkbox"
          checked={selectedBranches.has(branch)}
          onChange={() => {
            const newSet = new Set(selectedBranches)
            if (newSet.has(branch)) {
              newSet.delete(branch)
            } else {
              newSet.add(branch)
            }
            setSelectedBranches(newSet)
          }}
        />
        {branch}
      </label>
    ))}
  </div>
)}


    {/* 読み込み中／登録なし／リスト表示 */}
    {loading ? (
      <p>読み込み中...</p>
    ) : vehicles.length === 0 ? (
      <p>登録された車両がありません。</p>
    ) : (
      <>
        {/* 台数カウント */}
        <div className={styles.vehicleCountBox}>
          <p className={styles.vehicleCount}>
            全 {vehicles.length} 台中、{filteredVehicles.length} 台表示中
          </p>
        </div>

        {/* 車両リスト */}
        <ul className={styles.vehicleList}>
          {filteredVehicles.map((v) => (
       <li key={v.id} className={styles.vehicleItem}>
       <div className={styles.vehicleHeader}>
         <p><strong>営業所：{v.branch_name}</strong></p>
         <p><strong>車種：{v.car_model}</strong></p>
     
         {/* 右側にボタンを並べる */}
         <button onClick={() => toggleVehicleDetail(v.id)} className={styles.detailButton}>
           {openVehicleId === v.id ? '使用状況を閉じる' : '使用状況を表示する'}
         </button>
       </div>
     
       {/* 詳細エリア */}
       {openVehicleId === v.id && (
         <div className={styles.vehicleDetailArea}>
           <p>使用住所：{v.garage_address}</p>
           <p>車検期限：{v.inspection_date}</p>
           <p>次回法定点検日：{v.next_due_date || '未登録'}</p>
           <p>最終オイル交換日：{v.last_oil_change_date || '未登録'}</p>
           <p>最終エレメント交換日：{v.last_element_change_date || '未登録'}</p>
           <p>最終タイヤ交換日：{v.last_tire_change_date || '未登録'}</p>
           <p>最終バッテリー交換日：{v.last_battery_change_date || '未登録'}</p>
           <p>通知方法：{v.notification_type === 'group' ? 'LINEグループ' : '担当者通知'}</p>
         </div>
       )}     

              {/* ボタン群 */}
{/* ボタン群 */}
<div className={styles.buttonGroup}>

  {/* 1段目（車検・整備スケジュール） */}
  <div className={styles.buttonRow}>
  <button onClick={() => openInspectionEditModal(v)} className={styles.attentionButton}>
    車検情報を更新する
  </button>
  <button onClick={() => openNextInspectionEditModal(v)} className={styles.attentionButton}>
    整備スケジュール更新
  </button>
</div>

  {/* 2段目（消耗品交換） */}
  <div className={styles.buttonRow}>
    <button onClick={() => handleOilChangeComplete(v.id)} className={styles.inspectionButton}>
      オイル交換完了
    </button>
    <button onClick={() => handleElementChangeComplete(v.id)} className={styles.inspectionButton}>
      エレメント交換完了
    </button>
    <button onClick={() => handleTireChangeComplete(v.id)} className={styles.inspectionButton}>
      タイヤ交換完了
    </button>
    <button onClick={() => handleBatteryChangeComplete(v.id)} className={styles.inspectionButton}>
      バッテリー交換完了
    </button>
  </div>

  {/* 3段目（編集・削除） */}
  <div className={styles.buttonRow}>
    <button onClick={() => { console.log('編集ボタン押された', v); openEditModal(v) }} className={styles.editButton}>
      登録車両を編集する
    </button>

    <button onClick={() => handleDelete(v.id, v.company_id)} className={styles.deleteButton}>
  車両を削除する
</button>
  </div>

</div>
            </li>
          ))}
        </ul>
      </>
    )}

    {/* 戻る・登録ボタン */}
    <div className={styles.buttonWrapper}>
      <Link href="/dashboard">
        <button className={styles.secondaryButton}><ArrowLeft size={16} /> ダッシュボードに戻る</button>
      </Link>
      <Link href="/vehicles/new">
        <button className={styles.primaryButton}><PlusCircle size={16} /> 車両を登録する</button>
      </Link>
    </div>

  </div>
)
  };  