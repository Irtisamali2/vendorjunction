import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'
import PartnerLogin from './pages/PartnerLogin'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import PartnerLayout from './layouts/PartnerLayout'

// Admin pages
import Dashboard from './pages/admin/Dashboard'
import Partners from './pages/admin/Partners'
import PartnerDetail from './pages/admin/PartnerDetail'
import EmailConfig from './pages/admin/EmailConfig'
import EmailTemplates from './pages/admin/EmailTemplates'
import EmailLogs from './pages/admin/EmailLogs'

// Partner pages
import PartnerDashboard from './pages/partner/PartnerDashboard'

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #2D3748',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#1E293B' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#1E293B' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/partner/login" element={<PartnerLogin />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="partners" element={<Partners />} />
          <Route path="partners/:id" element={<PartnerDetail />} />
          <Route path="email/config" element={<EmailConfig />} />
          <Route path="email/templates" element={<EmailTemplates />} />
          <Route path="email/logs" element={<EmailLogs />} />
        </Route>

        {/* Partner routes */}
        <Route
          path="/partner/*"
          element={
            <ProtectedRoute role="partner">
              <PartnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PartnerDashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
