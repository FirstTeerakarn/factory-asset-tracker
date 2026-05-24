// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'
  return (
    <div className={`${s} border-2 border-surface-border border-t-brand-500 rounded-full animate-spin`} />
  )
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    available:   { label: 'ว่าง',        cls: 'badge-available' },
    in_use:      { label: 'กำลังใช้',    cls: 'badge-in_use'    },
    maintenance: { label: 'ซ่อมบำรุง',   cls: 'badge-maintenance' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'badge bg-slate-700 text-slate-300' }
  return (
    <span className={cls}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  )
}

export function RoleBadge({ role }) {
  return (
    <span className={role === 'admin' ? 'badge-admin' : 'badge-staff'}>
      {role === 'admin' ? 'Admin' : 'Staff'}
    </span>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative card w-full max-w-md fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-slate-100">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-400 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-outline">ยกเลิก</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger">
          {loading ? <Spinner size="sm" /> : 'ยืนยัน'}
        </button>
      </div>
    </Modal>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center text-slate-500 text-2xl">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {desc && <p className="text-xs text-slate-500 max-w-xs">{desc}</p>}
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let _setToast = null

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  _setToast = (msg, type = 'success') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }
  return (
    <>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg text-sm font-medium fade-up shadow-xl border
              ${t.type === 'error'
                ? 'bg-red-900/80 text-red-200 border-red-800'
                : 'bg-emerald-900/80 text-emerald-200 border-emerald-800'}`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </>
  )
}

import { useState } from 'react'
export const toast = (msg, type) => _setToast?.(msg, type)
