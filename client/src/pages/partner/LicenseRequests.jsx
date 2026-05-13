import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, FileText, Clock, CheckCircle, XCircle, X, Package } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', Icon: Clock, label: 'Pending' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', Icon: CheckCircle, label: 'Approved' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', Icon: XCircle, label: 'Rejected' },
}

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function RequestModal({ programs, onClose, onSuccess }) {
  const [selectedProgram, setSelectedProgram] = useState('')
  const [licenses, setLicenses] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const chosen = programs.find(p => String(p.id) === String(selectedProgram))
  const estTotal = chosen && licenses ? parseInt(licenses) * chosen.credits * Number(chosen.credit_unit_price) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProgram || !licenses || parseInt(licenses) < 1) {
      toast.error('Please select a program and enter a valid number of licenses')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/api/license-requests', {
        program_id: parseInt(selectedProgram),
        requested_licenses: parseInt(licenses),
        notes: notes.trim() || undefined,
      })
      toast.success('License request submitted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header">
          <h3 className="modal-title">New License Request</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Program <span className="required">*</span></label>
              <select className="form-select" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} required>
                <option value="">Select a program</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.program_name} — {p.credits} credits @ ${Number(p.credit_unit_price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Licenses <span className="required">*</span></label>
              <input
                className="form-input" type="number" min="1" placeholder="e.g. 10"
                value={licenses} onChange={e => setLicenses(e.target.value)} required
              />
            </div>

            {chosen && licenses && parseInt(licenses) > 0 && (
              <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Cost Estimate</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  <span>Credits per license</span><span>{chosen.credits}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  <span>Total credits</span><span>{(parseInt(licenses) * chosen.credits).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: 'var(--accent-gold)', borderTop: '1px solid var(--border-default)', paddingTop: '10px', marginTop: '5px' }}>
                  <span>Est. Total</span>
                  <span>${estTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" rows={3} placeholder="Any additional context for this request..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <><Send size={14} /> Submit</>}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function PartnerLicenseRequests() {
  const [profile, setProfile] = useState(null)
  const [programs, setPrograms] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('')
  const [showModal, setShowModal] = useState(false)

  const loadData = async () => {
    try {
      const profileRes = await api.get('/api/partners/me/profile')
      const p = profileRes.data.data || profileRes.data
      setProfile(p)
      if (p?.id && p?.status === 'approved') {
        const [progRes, lrRes] = await Promise.all([
          api.get(`/api/programs/${p.id}`),
          api.get('/api/license-requests/my'),
        ])
        setPrograms(progRes.data.data || [])
        setRequests(lrRes.data.data || [])
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}><div className="spinner" /></div>

  const filtered = tab ? requests.filter(r => r.status === tab) : requests
  const counts = { pending: requests.filter(r => r.status === 'pending').length, approved: requests.filter(r => r.status === 'approved').length, rejected: requests.filter(r => r.status === 'rejected').length }

  const isApproved = profile?.status === 'approved'

  if (!isApproved) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>License Requests Unavailable</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>License requests are only available for approved partners.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>License Requests</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {requests.length} total · {counts.pending} pending · {counts.approved} approved
          </p>
        </div>
        {programs.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ gap: '7px' }}>
            <Send size={14} /> New Request
          </button>
        )}
      </motion.div>

      {/* No programs state */}
      {programs.length === 0 && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Package size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>No Price Cards Assigned</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>You need at least one price card assigned before you can request licenses.</p>
        </div>
      )}

      {programs.length > 0 && (
        <>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-default)', width: 'fit-content' }}>
            {STATUS_TABS.map(t => {
              const active = tab === t.value
              const count = t.value ? counts[t.value] : requests.length
              return (
                <button key={t.value} onClick={() => setTab(t.value)}
                  style={{
                    padding: '7px 16px', borderRadius: '9px', cursor: 'pointer', border: 'none',
                    fontSize: '13px', fontWeight: active ? '700' : '500',
                    background: active ? 'var(--bg-primary)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                  {t.label}
                  {count > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: '18px', height: '18px', borderRadius: '9px', padding: '0 4px',
                      background: active ? 'var(--accent-primary)' : 'var(--bg-surface-2)',
                      color: active ? 'white' : 'var(--text-muted)',
                      fontSize: '10px', fontWeight: '800',
                    }}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Requests */}
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                {tab ? `No ${tab} requests` : 'No requests yet'}
              </p>
              {!tab && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ marginTop: '12px' }}>
                  <Send size={13} /> Submit Your First Request
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((req, i) => {
                const sc = STATUS_COLORS[req.status] || STATUS_COLORS.pending
                const StatusIcon = sc.Icon
                const estValue = req.requested_licenses * req.credits * Number(req.credit_unit_price)
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '18px 20px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{req.program_name}</span>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                            color: sc.color, background: sc.bg,
                          }}>
                            <StatusIcon size={12} /> {sc.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>Licenses</div>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{req.requested_licenses}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>Est. Value</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-gold)' }}>
                              ${estValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>Submitted</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              {req.requested_at ? format(new Date(req.requested_at), 'MMM dd, yyyy') : '—'}
                            </div>
                          </div>
                          {req.reviewed_at && (
                            <div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700' }}>Reviewed</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {format(new Date(req.reviewed_at), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          )}
                        </div>
                        {req.notes && (
                          <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <strong>Your notes:</strong> {req.notes}
                          </div>
                        )}
                        {req.admin_notes && (
                          <div style={{
                            marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
                            background: sc.bg, border: `1px solid ${sc.color}30`,
                            fontSize: '12px', color: 'var(--text-secondary)',
                          }}>
                            <strong style={{ color: sc.color }}>Admin notes: </strong>{req.admin_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <RequestModal programs={programs} onClose={() => setShowModal(false)} onSuccess={loadData} />
        )}
      </AnimatePresence>
    </div>
  )
}
