import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AssetsPage from './pages/AssetsPage'
import UsersPage from './pages/UsersPage'
import LogsPage from './pages/LogsPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout><DashboardPage /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/assets"
        element={
          <PrivateRoute>
            <Layout><AssetsPage /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <AdminRoute>
            <Layout><UsersPage /></Layout>
          </AdminRoute>
        }
      />

      <Route
        path="/logs"
        element={
          <AdminRoute>
            <Layout><LogsPage /></Layout>
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
