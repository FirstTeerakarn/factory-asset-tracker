import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
       ${isActive
         ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
         : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'}`
    }
  >
    <span className="text-lg leading-none">{icon}</span>
    {label}
  </NavLink>
)

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-surface-border flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100 leading-tight">Asset Tracker</p>
              <p className="text-[10px] text-slate-500 leading-tight font-mono">v1.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider px-3 mb-2">ระบบ</p>
          <NavItem to="/dashboard" icon="⬡" label="Dashboard" />
          <NavItem to="/assets" icon="⊟" label="อุปกรณ์" />
          {isAdmin && (
            <>
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider px-3 mt-4 mb-2">จัดการ</p>
              <NavItem to="/users" icon="⊕" label="พนักงาน" />
              <NavItem to="/logs" icon="⊞" label="ประวัติ" />
            </>
          )}
        </nav>

        {/* User section */}
        <div className="px-3 pb-4 border-t border-surface-border pt-3">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-brand-800 flex items-center justify-center text-xs font-medium text-brand-300">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-500">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full justify-start text-xs py-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
