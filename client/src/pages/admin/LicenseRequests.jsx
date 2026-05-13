import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, XCircle, Clock, X, FileText, Building2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending', color: '#F59E0B' },
  { value: 'approved', label: 'Approved', color: '#10B981' },
  { value: 'rejected', label: 'Rejected', color: '#EF4444' },
]

const STATUS_COLORS = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', Icon: Clock },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', Icon: CheckCircle },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', Icon: XCircle },
}

function ReviewModal({ request, onClose, onDone }) {
  const [decision, setDecision] = useState(null) // 'approved' | 'rejected'
  const [adminNotes, setAdminNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!decision) { toast.error('Please select Approve or Reject'); return }
    setSubmitting(true)
    try {
      await api.patch(`/api/license-requests/${request.id}/status`, { status: decision, admin_notes: adminNotes })
      toast.success(`Request ${decision}`)
      onDone()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request')
    } finally {
      setSubmitting(false)
    }
  }

  const totalCredits = request.requested_licenses * request.credits
  const estimatedValue = totalCredits * Number(request.credit_unit_price)

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ maxWidth: '520px' }}
      >
        <div className="modal-header">
          <h3 className="modal-title">Review License Request</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Request summary */}
          <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Partner</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{request.company_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Program</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{request.program_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Licenses</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{request.requested_licenses}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Credits</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>{totalCredits.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Est. Value</span>
              <span style={{ fontSize: '15px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                ${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {request.notes && (
              <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Partner Notes: </strong>
                {request.notes}
              </div>
            )}
          </div>

          {/* Decision buttons */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Decision <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDecision('approved')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  border: `2px solid ${decision === 'approved' ? '#10B981' : 'var(--border-default)'}`,
                  background: decision === 'approved' ? 'rgba(16,185,129,0.1)' : 'var(--bg-surface)',
                  color: decision === 'approved' ? '#10B981' : 'var(--text-secondary)',
                  fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button
                onClick={() => setDecision('rejected')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  border: `2px solid ${decision === 'rejected' ? '#EF4444' : 'var(--border-default)'}`,
                  background: decision === 'rejected' ? 'rgba(239,68,68,0.1)' : 'var(--bg-surface)',
                  color: decision === 'rejected' ? '#EF4444' : 'var(--text-secondary)',
                  fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>

          {/* Admin notes */}
          <div className="form-group">
            <label className="form-label">Admin Notes (visible to partner)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Add any notes or comments for the partner..."
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className={`btn ${decision === 'approved' ? 'btn-success' : decision === 'rejected' ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleSubmit}
              disabled={submitting || !decision}
            >
              {submitting
                ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : `Confirm ${decision ? decision.charAt(0).toUpperCase() + decision.slice(1) : 'Decision'}`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function LicenseRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const LIMIT = 20

  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [reviewItem, setReviewItem] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await api.get(`/api/license-requests?${params}`)
      setRequests(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch {
      toast.error('Failed to load license requests')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const pages = Math.ceil(total / LIMIT)

  // Count by status for tab badges
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>License Requests</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {total.toLocaleString()} total requests from approved partners
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchRequests} style={{ gap: '6px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-default)', width: 'fit-content', flexWrap: 'wrap' }}>
        {STATUS_TABS.map(tab => {
          const active = statusFilter === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1) }}
              style={{
                padding: '7px 18px', borderRadius: '9px', cursor: 'pointer',
                border: 'none', fontSize: '13px', fontWeight: active ? '700' : '500',
                background: active ? 'var(--bg-primary)' : 'transparent',
                color: active ? (tab.color || 'var(--text-primary)') : 'var(--text-muted)',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: '6px', width: '18px', height: '18px', borderRadius: '50%',
                  background: '#F59E0B', color: 'white', fontSize: '10px', fontWeight: '800',
                }}>{pendingCount}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search by company, program, or email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <button type="submit" className="btn btn-ghost btn-sm"><Search size={14} /></button>
        {search && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }} style={{ color: 'var(--danger)' }}>
            <X size={14} /> Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px' }}>
            <FileText size={40} />
            <p>{statusFilter ? `No ${statusFilter} requests` : 'No license requests yet'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  {['Partner', 'Program', 'Licenses', 'Est. Value', 'Status', 'Notes', 'Submitted', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => {
                  const sc = STATUS_COLORS[req.status] || STATUS_COLORS.pending
                  const StatusIcon = sc.Icon
                  const estValue = req.requested_licenses * req.credits * Number(req.credit_unit_price)
                  return (
                    <motion.tr
                      key={req.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: '1px solid var(--border-default)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 size={15} color="var(--text-muted)" />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{req.company_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{req.partner_email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{req.program_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{req.credits} credits × ${Number(req.credit_unit_price).toFixed(2)}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
                        {req.requested_licenses}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--accent-gold)' }}>
                        ${estValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '4px 10px', borderRadius: '20px',
                          fontSize: '12px', fontWeight: '600',
                          color: sc.color, background: sc.bg,
                        }}>
                          <StatusIcon size={12} />
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', maxWidth: '140px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{req.admin_notes || '—'}</span>
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {req.requested_at ? format(new Date(req.requested_at), 'MMM dd, yyyy') : '—'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {req.requested_at ? format(new Date(req.requested_at), 'HH:mm') : ''}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {req.status === 'pending' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setReviewItem(req)}
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setReviewItem(req)}
                            style={{ fontSize: '11px' }}
                          >
                            View
                          </button>
                        )}
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

      {/* Review Modal */}
      <AnimatePresence>
        {reviewItem && (
          <ReviewModal
            request={reviewItem}
            onClose={() => setReviewItem(null)}
            onDone={fetchRequests}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
