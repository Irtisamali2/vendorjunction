import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Clock, CheckCircle, XCircle, Zap,
  TrendingUp, ArrowUpRight, Bell, FileText,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import api from '../../utils/api'

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

function StatCard({ icon: Icon, label, value, color, colorLight, delay, loading, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      whileHover={onClick ? { y: -3, boxShadow: `0 8px 24px ${color}22` } : {}}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: colorLight, opacity: 0.5,
      }} />
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: colorLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}40`,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
          {loading ? <div className="skeleton" style={{ width: '60px', height: '32px' }} /> : (Number(value) || 0)}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500' }}>
          {label}
        </div>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: '10px', padding: '12px 16px',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '16px' }}>
          {payload[0].value} registrations
        </p>
      </div>
    )
  }
  return null
}

function SectionHeading({ label, delay }) {
  return (
    <motion.h3
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      style={{
        fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px',
      }}
    >
      {label}
    </motion.h3>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [licStats, setLicStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [licLoading, setLicLoading] = useState(true)

  useEffect(() => {
    api.get('/api/partners/stats')
      .then((res) => {
        const raw = res.data.stats || {}
        setStats({
          total:     Number(raw.total     ?? 0),
          pending:   Number(raw.pending   ?? 0),
          approved:  Number(raw.approved  ?? 0),
          rejected:  Number(raw.rejected  ?? 0),
          suspended: Number(raw.suspended ?? 0),
          today:     Number(raw.today     ?? 0),
        })
        setRecent(res.data.recent || [])
        setMonthlyData(res.data.monthlyData || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    api.get('/api/license-requests/stats')
      .then((res) => {
        const raw = res.data.stats || {}
        setLicStats({
          new:      Number(raw.new      ?? 0),
          pending:  Number(raw.pending  ?? 0),
          approved: Number(raw.approved ?? 0),
          rejected: Number(raw.rejected ?? 0),
        })
      })
      .catch(() => {})
      .finally(() => setLicLoading(false))
  }, [])

  const PARTNER_CARDS = [
    { icon: Users,       label: 'Total Partners', value: stats?.total,    color: '#0D9488', colorLight: 'rgba(13,148,136,0.12)',  onClick: () => navigate('/admin/partners') },
    { icon: Clock,       label: 'Pending Review', value: stats?.pending,  color: '#F59E0B', colorLight: 'rgba(245,158,11,0.12)',  onClick: () => navigate('/admin/partners?status=pending') },
    { icon: CheckCircle, label: 'Approved',        value: stats?.approved, color: '#10B981', colorLight: 'rgba(16,185,129,0.12)', onClick: () => navigate('/admin/partners?status=approved') },
    { icon: XCircle,     label: 'Rejected',        value: stats?.rejected, color: '#EF4444', colorLight: 'rgba(239,68,68,0.12)',  onClick: () => navigate('/admin/partners?status=rejected') },
    { icon: Zap,         label: 'Today',           value: stats?.today,   color: '#0D9488', colorLight: 'rgba(13,148,136,0.12)',  onClick: () => navigate('/admin/partners') },
  ]

  const LICENSE_CARDS = [
    { icon: Bell,        label: 'New',     value: licStats?.new,      color: '#6366F1', colorLight: 'rgba(99,102,241,0.12)',   onClick: () => navigate('/admin/license-requests?filter=new') },
    { icon: Clock,       label: 'Pending', value: licStats?.pending,  color: '#F59E0B', colorLight: 'rgba(245,158,11,0.12)',  onClick: () => navigate('/admin/license-requests?status=pending') },
    { icon: CheckCircle, label: 'Approved',value: licStats?.approved, color: '#10B981', colorLight: 'rgba(16,185,129,0.12)', onClick: () => navigate('/admin/license-requests?status=approved') },
    { icon: XCircle,     label: 'Rejected',value: licStats?.rejected, color: '#EF4444', colorLight: 'rgba(239,68,68,0.12)',  onClick: () => navigate('/admin/license-requests?status=rejected') },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Partners Section */}
      <div>
        <SectionHeading label="Partners" delay={0} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {PARTNER_CARDS.map((card, i) => (
            <StatCard key={i} {...card} delay={i * 0.08} loading={loading} />
          ))}
        </div>
      </div>

      {/* License Requests Section */}
      <div>
        <SectionHeading label="License Requests" delay={0.45} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {LICENSE_CARDS.map((card, i) => (
            <StatCard key={i} {...card} delay={0.5 + i * 0.08} loading={licLoading} />
          ))}
        </div>
      </div>

      {/* Chart + Status Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.82 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--accent-primary)" />
                Monthly Registrations
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Last 6 months</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              color: 'var(--success)', fontSize: '12px', fontWeight: '600',
            }}>
              <ArrowUpRight size={14} />
              Active
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#0D9488" strokeWidth={2} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--accent-gold)" />
              Status Overview
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            {[
              { label: 'Approved', value: stats?.approved || 0, total: stats?.total || 1, color: '#10B981' },
              { label: 'Pending', value: stats?.pending || 0, total: stats?.total || 1, color: '#F59E0B' },
              { label: 'Rejected', value: stats?.rejected || 0, total: stats?.total || 1, color: '#EF4444' },
              { label: 'Suspended', value: stats?.suspended || 0, total: stats?.total || 1, color: '#64748B' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: item.color }}>{item.value}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    background: item.color,
                    width: `${item.total ? (item.value / item.total) * 100 : 0}%`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.96 }}
        className="card"
      >
        <div className="card-header">
          <div className="card-title">Recent Applications</div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: '16px', width: j === 0 ? '120px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <Users size={32} />
                      <p>No recent applications</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recent.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/admin/partners/${p.id}`)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      {p.title} {p.first_name} {p.last_name}
                    </td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>{p.company_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.city}, {p.country}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {p.submitted_at ? format(new Date(p.submitted_at), 'MMM dd, yyyy') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
