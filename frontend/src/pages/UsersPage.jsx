import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { RoleBadge, Modal, ConfirmDialog, Spinner, EmptyState } from '../components/ui'

const EMPTY_FORM = { username: '', password: '', role: 'staff' }

function UserForm({ initial = EMPTY_FORM, isEdit = false, onSave, loading }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="label">ชื่อผู้ใช้</label>
        <input className="input" placeholder="username" value={form.username} onChange={(e) => set('username', e.target.value)} />
      </div>
      <div>
        <label className="label">{isEdit ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน'}</label>
        <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />
      </div>
      <div>
        <label className="label">สิทธิ์การใช้งาน</label>
        <select className="input" value={form.role} onChange={(e) => set('role', e.target.value)}>
          <option value="staff">Staff — พนักงานทั่วไป</option>
          <option value="admin">Admin — ผู้ดูแลระบบ</option>
        </select>
      </div>
      <button onClick={() => onSave(form)} disabled={loading} className="btn-primary w-full justify-center mt-1">
        {loading ? <Spinner size="sm" /> : 'บันทึก'}
      </button>
    </div>
  )
}

export default function UsersPage() {
  const { user: me } = useAuth()
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()
  const { run, loading: actionLoading } = useAsync()

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const handleCreate = async (form) => {
    await run(() => createUser(form))
    setCreateOpen(false)
  }

  const handleUpdate = async (form) => {
    await run(() => updateUser(editItem.id, form))
    setEditItem(null)
  }

  const handleDelete = async () => {
    await run(() => deleteUser(deleteItem.id))
    setDeleteItem(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 fade-up">
        <div>
          <h1 className="text-xl font-medium text-slate-100">พนักงาน</h1>
          <p className="text-sm text-slate-500 mt-0.5">จัดการบัญชีผู้ใช้งานในระบบ</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          เพิ่มพนักงาน
        </button>
      </div>

      <div className="card p-0 overflow-hidden fade-up-1">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <EmptyState icon="⊕" title="ยังไม่มีพนักงาน" />
        ) : (
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                <th className="th">ชื่อผู้ใช้</th>
                <th className="th">สิทธิ์</th>
                <th className="th">วันที่เพิ่ม</th>
                <th className="th text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="td">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-800 flex items-center justify-center text-xs font-medium text-brand-300">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-200">{u.username}</span>
                      {u.id === me?.id && (
                        <span className="text-[10px] text-slate-500 bg-surface-hover px-1.5 py-0.5 rounded">ฉัน</span>
                      )}
                    </div>
                  </td>
                  <td className="td"><RoleBadge role={u.role} /></td>
                  <td className="td text-slate-500 font-mono text-xs">
                    {new Date(u.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditItem(u)} className="btn-ghost text-xs py-1">แก้ไข</button>
                      {u.id !== me?.id && (
                        <button onClick={() => setDeleteItem(u)} className="btn-danger text-xs py-1">ลบ</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="เพิ่มพนักงานใหม่">
        <UserForm onSave={handleCreate} loading={actionLoading} />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="แก้ไขข้อมูลพนักงาน">
        {editItem && (
          <UserForm isEdit initial={{ username: editItem.username, password: '', role: editItem.role }} onSave={handleUpdate} loading={actionLoading} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete} loading={actionLoading}
        title="ยืนยันการลบ"
        message={`ต้องการลบบัญชี "${deleteItem?.username}" ออกจากระบบหรือไม่?`}
      />
    </div>
  )
}
