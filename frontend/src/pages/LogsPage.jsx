import { useState } from 'react'
import { useLogs } from '../hooks/useLogs'
import { Spinner, EmptyState } from '../components/ui'

const ACTION_MAP = {
  created:     { label: 'เพิ่มอุปกรณ์', color: 'bg-brand-900/40 text-brand-400 border-brand-800/60' },
  updated:     { label: 'แก้ไขข้อมูล',  color: 'bg-slate-700/60 text-slate-300 border-slate-600/60' },
  deleted:     { label: 'ลบอุปกรณ์',   color: 'bg-red-900/40 text-red-400 border-red-900/60' },
  checked_out: { label: 'เบิกอุปกรณ์',  color: 'bg-amber-900/40 text-amber-400 border-amber-900/60' },
  checked_in:  { label: 'คืนอุปกรณ์',  color: 'bg-emerald-900/40 text-emerald-400 border-emerald-900/60' },
}

export default function LogsPage() {
  const [filterAction, setFilterAction] = useState('')
  const { logs, loading } = useLogs({ action: filterAction || undefined, limit: 200 })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 fade-up">
        <div>
          <h1 className="text-xl font-medium text-slate-100">ประวัติกิจกรรม</h1>
          <p className="text-sm text-slate-500 mt-0.5">บันทึกความเคลื่อนไหวทั้งหมดในระบบ</p>
        </div>
        <select className="input max-w-[180px]" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
          <option value="">ทุกกิจกรรม</option>
          <option value="checked_out">เบิกอุปกรณ์</option>
          <option value="checked_in">คืนอุปกรณ์</option>
          <option value="created">เพิ่มอุปกรณ์</option>
          <option value="updated">แก้ไขข้อมูล</option>
          <option value="deleted">ลบอุปกรณ์</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden fade-up-1">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : logs.length === 0 ? (
          <EmptyState icon="⊞" title="ยังไม่มีประวัติ" />
        ) : (
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                <th className="th">วันเวลา</th>
                <th className="th">กิจกรรม</th>
                <th className="th">อุปกรณ์</th>
                <th className="th">ผู้ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const action = ACTION_MAP[l.action] ?? { label: l.action, color: 'bg-slate-700/60 text-slate-300 border-slate-600/60' }
                return (
                  <tr key={l.id} className="table-row">
                    <td className="td font-mono text-xs text-slate-500">
                      {new Date(l.log_date).toLocaleString('th-TH')}
                    </td>
                    <td className="td">
                      <span className={`badge border ${action.color}`}>{action.label}</span>
                    </td>
                    <td className="td">
                      <p className="text-sm text-slate-200">{l.asset_name ?? '(ถูกลบแล้ว)'}</p>
                      <p className="text-xs font-mono text-slate-500">{l.asset_code ?? `#${l.asset_id}`}</p>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand-800 flex items-center justify-center text-[10px] text-brand-300 font-medium">
                          {l.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm text-slate-300">{l.username ?? 'Unknown'}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
