import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, Shield, User, Building2, FileText, Mail, Package, Activity, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: Activity, color: '#94A3B8' },
  { value: 'auth', label: 'Authentication', icon: Shield, color: '#6366F1' },
  { value: 'partner', label: 'Partner', icon: Building2, color: '#0D9488' },
  { value: 'program', label: 'Price Card', icon: Package, color: '#F59E0B' },
  { value: 'license', label: 'License', icon: FileText, color: '#10B981' },
  { value: 'email', label: 'Email', icon: Mail, color: '#3B82F6' },
  { value: 'attachment', label: 'Attachment', icon: FileText, color: '#8B5CF6' },
  { value: 'system', label: 'System', icon: Activity, color: '#94A3B8' },
]

const ACTOR_TYPES = [
  { value: '', label: 'All Actors' },
  { value: 'admin', label: 'Admin' },
  { value: 'partner', label: 'Partner' },
  { value: 'system', label: 'System' },
]

const ACTION_META = {
  login: { label: 'Login', color: '#10B981' },
  logout: { label: 'Logout', color: '#6366F1' },
  login_failed: { label: 'Login Failed', color: '#EF4444' },
  registered: { label: 'Registered', color: '#0D9488' },
  status_approved: { label: 'Approved', color: '#10B981' },
  status_rejected: { label: 'Rejected', color: '#EF4444' },
  status_suspended: { label: 'Suspended', color: '#F59E0B' },
  status_pending: { label: 'Status → Pending', color: '#94A3B8' },
  program_added: { label: 'Program Added', color: '#0D9488' },
  program_updated: { label: 'Program Updated', color: '#F59E0B' },
  program_deleted: { label: 'Program Deleted', color: '#EF4444' },
  license_requested: { label: 'License Requested', color: '#6366F1' },
  license_approved: { label: 'License Approved', color: '#10B981' },
  license_rejected: { label: 'License Rejected', color: '#EF4444' },
}

function ActionBadge({ action }) {
  const meta = ACTION_META[action] || { label: action, color: '#94A3B8' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
      fontSize: '11px', fontWeight: '600',
      color: meta.color,
      background: meta.color + '20',
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  )
}

function ActorBadge({ type }) {
  const colors = { admin: '#0D9488', partner: '#6366F1', system: '#94A3B8' }
  const color = colors[type] || '#94A3B8'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '6px',
      fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase',
      color, background: color + '18',
    }}>
      {type}
    </span>
  )
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const LIMIT = 50

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [actorType, setActorType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (actorType) params.set('actor_type', actorType)
      if (dateFrom) params.set('date_from', dateFrom)
      if (dateTo) params.set('date_to', dateTo)
      const res = await api.get(`/api/activity-logs?${params}`)
      setLogs(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }, [page, search, category, actorType, dateFrom, dateTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const clearFilters = () => {
    setSearch(''); setSearchInput(''); setCategory(''); setActorType('')
    setDateFrom(''); setDateTo(''); setPage(1)
  }

  const hasFilters = search || category || actorType || dateFrom || dateTo
  const pages = Math.ceil(total / LIMIT)

  const getCategoryIcon = (cat) => {
    const found = CATEGORIES.find(c => c.value === cat)
    if (!found) return { Icon: Activity, color: '#94A3B8' }
    return { Icon: found.icon, color: found.color }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Activity Logs</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {total.toLocaleString()} total events — all portal activity tracked
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchLogs} style={{ gap: '6px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const active = category === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setPage(1) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px',
                fontSize: '12px', fontWeight: active ? '700' : '500',
                border: `1.5px solid ${active ? cat.color : 'var(--border-default)'}`,
                background: active ? cat.color + '18' : 'transparent',
                color: active ? cat.color : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Icon size={13} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Search + Filters Row */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <form onSubmit={handleSearch} style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search by actor, email, description..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ paddingLeft: '36px', paddingRight: search ? '36px' : '12px' }}
          />
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </form>

        <select className="form-select" style={{ width: 'auto', minWidth: '140px' }}
          value={actorType} onChange={e => { setActorType(e.target.value); setPage(1) }}>
          {ACTOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="date" className="form-input" style={{ width: 'auto' }}
            value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            placeholder="From" title="Date from" />
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to</span>
          <input type="date" className="form-input" style={{ width: 'auto' }}
            value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
            placeholder="To" title="Date to" />
        </div>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ gap: '6px', color: 'var(--danger)' }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px' }}>
            <Activity size={40} />
            <p>No activity logs found</p>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ marginTop: '8px' }}>Clear Filters</button>}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  {['Category', 'Action', 'Actor', 'Description', 'Entity', 'IP Address', 'Time'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const { Icon, color } = getCategoryIcon(log.category)
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      style={{ borderBottom: '1px solid var(--border-default)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={13} color={color} />
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{log.category}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <ActionBadge action={log.action} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <ActorBadge type={log.actor_type} />
                          {log.actor_name && <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{log.actor_name}</span>}
                          {log.actor_email && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.actor_email}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{log.description}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {log.entity_name ? (
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{log.entity_name}</div>
                            {log.entity_type && <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{log.entity_type}</div>}
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.actor_ip || '—'}</span>
                      </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {log.created_at ? format(new Date(log.created_at), 'MMM dd, yyyy') : '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {log.created_at ? format(new Date(log.created_at), 'HH:mm:ss') : ''}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}
