import { useAssets } from '../hooks/useAssets'
import { useLogs } from '../hooks/useLogs'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, Spinner } from '../components/ui'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-medium text-slate-100 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  )
}

const ACTION_LABEL = {
  created: 'เพิ่มอุปกรณ์', updated: 'แก้ไขข้อมูล',
  deleted: 'ลบอุปกรณ์', checked_out: 'เบิกอุปกรณ์', checked_in: 'คืนอุปกรณ์',
}

// ─── แยก Component ย่อยสำหรับดึงและแสดงผล Log (จะรันเฉพาะ Admin) ───
function RecentLogsSection() {
  const { logs, loading: logsLoading } = useLogs({ limit: 8 })

  if (logsLoading) return <Spinner size="sm" />

  return (
    <div className="flex flex-col gap-2.5">
      {logs.length === 0 && <p className="text-xs text-slate-500">ยังไม่มีกิจกรรม</p>}
      {logs.map((l) => (
        <div key={l.id} className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-slate-300">
              <span className="text-slate-400">{l.username}</span>
              {' '}{ACTION_LABEL[l.action] ?? l.action}{' '}
              <span className="text-slate-400">{l.asset_name ?? `#${l.asset_id}`}</span>
            </p>
            <p className="text-[11px] text-slate-600 font-mono mt-0.5">
              {new Date(l.log_date).toLocaleString('th-TH')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { assets, loading: assetsLoading } = useAssets()

  const counts = {
    total:       assets.length,
    available:   assets.filter((a) => a.status === 'available').length,
    in_use:      assets.filter((a) => a.status === 'in_use').length,
    maintenance: assets.filter((a) => a.status === 'maintenance').length,
  }

  if (assetsLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 fade-up">
        <h1 className="text-xl font-medium text-slate-100">สวัสดี, {user?.username} 👋</h1>
        <p className="text-sm text-slate-500 mt-0.5">ภาพรวมระบบจัดการอุปกรณ์</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 fade-up-1">
        <StatCard label="อุปกรณ์ทั้งหมด" value={counts.total}       color="bg-brand-900/50 text-brand-400"   icon="⊟" />
        <StatCard label="ว่างพร้อมใช้"   value={counts.available}   color="bg-emerald-900/40 text-emerald-400" icon="✓" />
        <StatCard label="กำลังใช้งาน"   value={counts.in_use}      color="bg-blue-900/40 text-blue-400"       icon="◉" />
        <StatCard label="ซ่อมบำรุง"     value={counts.maintenance} color="bg-amber-900/40 text-amber-400"     icon="⚙" />
      </div>

      <div className={`grid gap-5 fade-up-2 ${isAdmin ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="card">
          <h2 className="text-sm font-medium text-slate-300 mb-4">อุปกรณ์ล่าสุด</h2>
          <div className="flex flex-col gap-2">
            {assets.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-sm text-slate-200">{a.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{a.asset_code}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>

        {/* เรียกใช้ Component ย่อยภายใต้เงื่อนไข isAdmin ทำให้ Staff จะไม่รันลอจิกดึง Log เลย */}
        {isAdmin && (
          <div className="card">
            <h2 className="text-sm font-medium text-slate-300 mb-4">กิจกรรมล่าสุด</h2>
            <RecentLogsSection />
          </div>
        )}
      </div>
    </div>
  )
}