import { useState } from 'react'
import { useAssets } from '../hooks/useAssets'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, Modal, ConfirmDialog, Spinner, EmptyState } from '../components/ui'

const EMPTY_FORM = { asset_code: '', name: '', category: '', status: 'available' }

function AssetForm({ initial = EMPTY_FORM, onSave, loading }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">รหัสอุปกรณ์</label>
          <input className="input" placeholder="TL-001" value={form.asset_code} onChange={(e) => set('asset_code', e.target.value)} />
        </div>
        <div>
          <label className="label">หมวดหมู่</label>
          <input className="input" placeholder="Tools, Machine..." value={form.category} onChange={(e) => set('category', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">ชื่ออุปกรณ์</label>
        <input className="input" placeholder="กรอกชื่ออุปกรณ์" value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div>
        <label className="label">สถานะ</label>
        <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="available">ว่าง (Available)</option>
          <option value="in_use">กำลังใช้ (In Use)</option>
          <option value="maintenance">ซ่อมบำรุง (Maintenance)</option>
        </select>
      </div>
      <button onClick={() => onSave(form)} disabled={loading} className="btn-primary w-full justify-center mt-1">
        {loading ? <Spinner size="sm" /> : 'บันทึก'}
      </button>
    </div>
  )
}

export default function AssetsPage() {
  const { isAdmin, user } = useAuth()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const {
    assets, loading,
    createAsset, updateAsset, deleteAsset,
    checkoutAsset, checkinAsset,
  } = useAssets({ status: filterStatus || undefined, search: search || undefined })

  const { run, loading: actionLoading } = useAsync()

  const handleCreate = async (form) => {
    await run(() => createAsset(form))
    setCreateOpen(false)
  }

  const handleUpdate = async (form) => {
    await run(() => updateAsset(editItem.id, form))
    setEditItem(null)
  }

  const handleDelete = async () => {
    await run(() => deleteAsset(deleteItem.id))
    setDeleteItem(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 fade-up">
        <div>
          <h1 className="text-xl font-medium text-slate-100">อุปกรณ์</h1>
          <p className="text-sm text-slate-500 mt-0.5">จัดการข้อมูลอุปกรณ์ในโรงงาน</p>
        </div>
        {isAdmin && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มอุปกรณ์
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-4 fade-up-1">
        <input className="input max-w-xs" placeholder="ค้นหาชื่อ หรือรหัส..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[160px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">ทุกสถานะ</option>
          <option value="available">ว่าง</option>
          <option value="in_use">กำลังใช้</option>
          <option value="maintenance">ซ่อมบำรุง</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden fade-up-2">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : assets.length === 0 ? (
          <EmptyState icon="⊟" title="ไม่พบอุปกรณ์" desc="ลองเปลี่ยนเงื่อนไขการค้นหา" />
        ) : (
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                <th className="th">รหัส</th>
                <th className="th">ชื่ออุปกรณ์</th>
                <th className="th">หมวดหมู่</th>
                <th className="th">สถานะ</th>
                <th className="th">ผู้ใช้งาน</th>
                <th className="th text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="table-row">
                  <td className="td font-mono text-xs text-slate-400">{a.asset_code}</td>
                  <td className="td font-medium text-slate-200">{a.name}</td>
                  <td className="td text-slate-400">{a.category}</td>
                  <td className="td"><StatusBadge status={a.status} /></td>
                  <td className="td text-slate-400">{a.checked_out_by ?? '—'}</td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-2">
                      {a.status === 'available' && (
                        <button onClick={() => run(() => checkoutAsset(a))} className="btn-outline text-xs py-1">เบิก</button>
                      )}
                      {a.status === 'in_use' && (isAdmin || a.current_user_id === user?.id) && (
                        <button onClick={() => run(() => checkinAsset(a))} className="btn-outline text-xs py-1 text-emerald-400 border-emerald-900/60">คืน</button>
                      )}
                      {isAdmin && (
                        <>
                          <button onClick={() => setEditItem(a)} className="btn-ghost text-xs py-1">แก้ไข</button>
                          <button onClick={() => setDeleteItem(a)} className="btn-danger text-xs py-1">ลบ</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="เพิ่มอุปกรณ์ใหม่">
        <AssetForm onSave={handleCreate} loading={actionLoading} />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="แก้ไขข้อมูลอุปกรณ์">
        {editItem && (
          <AssetForm
            initial={{ asset_code: editItem.asset_code, name: editItem.name, category: editItem.category, status: editItem.status }}
            onSave={handleUpdate}
            loading={actionLoading}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete} loading={actionLoading}
        title="ยืนยันการลบ"
        message={`ต้องการลบ "${deleteItem?.name}" ออกจากระบบหรือไม่?`}
      />
    </div>
  )
}
