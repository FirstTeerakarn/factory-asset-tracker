import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(form)
      const { token, user } = res.data.data
      login(user, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-medium text-slate-100">Factory Asset Tracker</h1>
            <p className="text-xs text-slate-500">ระบบบริหารจัดการอุปกรณ์โรงงาน</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div>
            <label className="label">ชื่อผู้ใช้</label>
            <input
              className="input"
              placeholder="กรอก username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="label">รหัสผ่าน</label>
            <input
              type="password"
              className="input"
              placeholder="กรอก password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-1">
            {loading ? <Spinner size="sm" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Mini Factory Asset Tracker &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
