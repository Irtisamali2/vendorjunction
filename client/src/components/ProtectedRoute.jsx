import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/partner/login'} replace />
  }

  // Admin role: accept both 'admin' and 'superadmin'
  if (role === 'admin' && user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/admin/login" replace />
  }
  // Partner role
  if (role === 'partner' && user.role !== 'partner') {
    return <Navigate to="/partner/login" replace />
  }

  return children
}
