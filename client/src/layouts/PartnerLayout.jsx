import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, User, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/partner/' },
  { label: 'My Profile', icon: User, path: '/partner/profile' },
]

const PAGE_TITLES = {
  '/partner/': 'Dashboard',
  '/partner/profile': 'My Profile',
}

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => {
    if (path === '/partner/') return location.pathname === '/partner/' || location.pathname === '/partner'
    return location.pathname.startsWith(path)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>V</span>
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1 }}>
              VendorJunction
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.05em' }}>
              PARTNER PORTAL
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                fontSize: '14px', fontWeight: active ? '600' : '400',
                color: active ? 'white' : 'var(--text-secondary)',
                background: active ? 'var(--accent-gold)' : 'transparent',
                transition: 'all 0.15s ease', textDecoration: 'none',
                boxShadow: active ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-surface-2)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={14} />}
            </NavLink>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-default)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', marginBottom: '8px',
          background: 'var(--bg-surface)', borderRadius: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', color: 'white', flexShrink: 0,
          }}>
            {(user?.name || user?.email || 'P').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Partner'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            color: 'var(--danger)', fontSize: '14px', fontWeight: '500',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-light)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function PartnerLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const pageTitle = PAGE_TITLES[location.pathname] || 'Partner Portal'

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        zIndex: 100, display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay + Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'none' }}
              className="mobile-overlay"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 'var(--sidebar-width)',
                background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border-default)',
                zIndex: 300, display: 'flex', flexDirection: 'column',
              }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Topbar */}
      <header style={{
        position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0,
        height: 'var(--topbar-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', padding: '0 32px',
        justifyContent: 'space-between', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setMobileOpen(true)}
            style={{ display: 'none', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
            className="mobile-hamburger"
          >
            <Menu size={22} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{pageTitle}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.email}</span>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '700', color: 'white',
          }}>
            {(user?.name || user?.email || 'P').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main style={{ marginLeft: 'var(--sidebar-width)', paddingTop: 'var(--topbar-height)', minHeight: '100vh' }}>
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-hamburger { display: flex !important; }
          .mobile-overlay { display: block !important; }
          main { margin-left: 0 !important; }
          header { left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
