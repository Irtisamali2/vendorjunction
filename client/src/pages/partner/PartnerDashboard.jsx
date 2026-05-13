import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, Clock, XCircle, PauseCircle,
  User, Building2, MapPin, Mail, Phone, Globe, Briefcase, BookOpen, Hash,
  Send, FileText, TrendingUp, Package, X, ChevronDown,
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending: {
    icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)',
    title: 'Application Under Review',
    message: 'Your application has been received and is being reviewed by our team. You will be notified within 3–5 business days.',
  },
  approved: {
    icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)',
    title: 'Application Approved',
    message: 'Congratulations! You are an official VendorJunction partner. Submit license requests below for your programs.',
  },
  rejected: {
    icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)',
    title: 'Application Not Approved',
    message: 'Your application did not meet the requirements at this time. Review the feedback below.',
  },
  suspended: {
    icon: PauseCircle, color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)',
    title: 'Account Suspended',
    message: 'Your partner account has been temporarily suspended. Please contact support for more information.',
  },
}

const REQUEST_STATUS_COLORS = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Pending' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Approved' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Rejected' },
}

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color="var(--text-muted)" />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{value}</div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ padding: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  )
}

function LicenseRequestModal({ programs, onClose, onSuccess }) {
  const [selectedProgram, setSelectedProgram] = useState('')
  const [licenses, setLicenses] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      toast.success('License request submitted successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const chosen = programs.find(p => String(p.id) === String(selectedProgram))

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ maxWidth: '500px' }}
      >
        <div className="modal-header">
          <h3 className="modal-title">Request Licenses</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Program <span className="required">*</span></label>
              <select
                className="form-select"
                value={selectedProgram}
                onChange={e => setSelectedProgram(e.target.value)}
                required
              >
                <option value="">Select a program</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.program_name} — {p.credits} credits @ ${Number(p.credit_unit_price).toFixed(2)}/credit
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Number of Licenses <span className="required">*</span></label>
              <input
                className="form-input"
                type="number" min="1" placeholder="e.g. 10"
                value={licenses}
                onChange={e => setLicenses(e.target.value)}
                required
              />
            </div>
            {chosen && licenses && parseInt(licenses) > 0 && (
              <div style={{ padding: '14px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cost Estimate</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Credits per license</span><span>{chosen.credits}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Total credits</span><span>{parseInt(licenses) * chosen.credits}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: 'var(--accent-gold)', borderTop: '1px solid var(--border-default)', paddingTop: '8px', marginTop: '8px' }}>
                  <span>Estimated Total</span>
                  <span>${(parseInt(licenses) * chosen.credits * Number(chosen.credit_unit_price)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Any additional information for this request..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <><Send size={14} /> Submit Request</>}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function PartnerDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [programs, setPrograms] = useState([])
  const [licenseRequests, setLicenseRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)

  const loadData = async () => {
    try {
      const [profileRes] = await Promise.all([api.get('/api/partners/me/profile')])
      const p = profileRes.data.data || profileRes.data
      setProfile(p)

      if (p?.id && p?.status === 'approved') {
        const [progRes, lrRes] = await Promise.all([
          api.get(`/api/programs/${p.id}`),
          api.get('/api/license-requests/my'),
        ])
        setPrograms(progRes.data.data || [])
        setLicenseRequests(lrRes.data.data || [])
      }
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}><div className="spinner" /></div>
  }

  if (!profile) {
    return <div className="card"><div className="empty-state"><User size={40} /><p>Profile not found</p></div></div>
  }

  const statusConf = STATUS_CONFIG[profile.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConf.icon

  const isApproved = profile.status === 'approved'

  // Stats derived from data
  const pendingReqs = licenseRequests.filter(r => r.status === 'pending').length
  const approvedReqs = licenseRequests.filter(r => r.status === 'approved').length
  const totalCredits = programs.reduce((s, p) => s + Number(p.credits), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Welcome back, {profile.first_name}!
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {profile.company_name} — Partner Portal
        </p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        style={{ padding: '24px', background: statusConf.bg, border: `1px solid ${statusConf.border}`, borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: statusConf.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <StatusIcon size={24} color={statusConf.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{statusConf.title}</h3>
            <span className={`badge badge-${profile.status}`}>{profile.status}</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{statusConf.message}</p>
          {profile.rejection_reason && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger)', marginBottom: '3px' }}>Rejection Reason</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{profile.rejection_reason}</p>
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Registration Code</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: statusConf.color, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{profile.reg_code}</div>
        </div>
      </motion.div>

      {/* Stats (approved only) */}
      {isApproved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}
        >
          <StatCard icon={BookOpen} label="Active Programs" value={programs.length} color="#0D9488" bg="rgba(13,148,136,0.1)" />
          <StatCard icon={TrendingUp} label="Total Credits" value={totalCredits.toLocaleString()} color="#6366F1" bg="rgba(99,102,241,0.1)" />
          <StatCard icon={Clock} label="Pending Requests" value={pendingReqs} color="#F59E0B" bg="rgba(245,158,11,0.1)" />
          <StatCard icon={CheckCircle} label="Approved Requests" value={approvedReqs} color="#10B981" bg="rgba(16,185,129,0.1)" />
        </motion.div>
      )}

      {/* Programs + License Request */}
      {isApproved && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={17} color="var(--success)" />
              <div className="card-title">Your Price Cards</div>
            </div>
            {programs.length > 0 && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowRequestModal(true)}>
                <Send size={14} /> Request Licenses
              </button>
            )}
          </div>
          {programs.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <Package size={32} />
              <p>No price cards assigned yet. Contact your account manager.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Program Name</th>
                    <th>Credits</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map(prog => (
                    <tr key={prog.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{prog.program_name}</td>
                      <td>{prog.credits}</td>
                      <td>${Number(prog.credit_unit_price).toFixed(2)}</td>
                      <td style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>
                        ${(prog.credits * prog.credit_unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* License Requests History (approved only) */}
      {isApproved && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={17} color="var(--accent-primary)" />
              <div className="card-title">License Requests</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowRequestModal(true)}>
              <Send size={14} /> New Request
            </button>
          </div>
          {licenseRequests.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <FileText size={32} />
              <p>No license requests yet.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => setShowRequestModal(true)}>
                <Send size={14} /> Submit Your First Request
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Licenses</th>
                    <th>Status</th>
                    <th>Admin Notes</th>
                    <th>Submitted</th>
                    <th>Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {licenseRequests.map(lr => {
                    const sc = REQUEST_STATUS_COLORS[lr.status] || REQUEST_STATUS_COLORS.pending
                    return (
                      <tr key={lr.id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{lr.program_name}</td>
                        <td style={{ fontWeight: '600' }}>{lr.requested_licenses}</td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                            fontSize: '12px', fontWeight: '600',
                            color: sc.color, background: sc.bg,
                          }}>{sc.label}</span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '160px' }}>
                          {lr.admin_notes || '—'}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {lr.requested_at ? format(new Date(lr.requested_at), 'MMM dd, yyyy') : '—'}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {lr.reviewed_at ? format(new Date(lr.reviewed_at), 'MMM dd, yyyy') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Contact + Company Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="partner-info-grid">
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={17} color="var(--accent-primary)" />
              <div className="card-title">Contact Information</div>
            </div>
          </div>
          <InfoItem icon={User} label="Full Name" value={`${profile.title || ''} ${profile.first_name} ${profile.last_name}`.trim()} />
          <InfoItem icon={Briefcase} label="Job Title" value={profile.job_title} />
          <InfoItem icon={Mail} label="Email" value={profile.email} />
          <InfoItem icon={Phone} label="Mobile" value={profile.mobile} />
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={17} color="var(--accent-gold)" />
              <div className="card-title">Company Information</div>
            </div>
          </div>
          <InfoItem icon={Building2} label="Company" value={profile.company_name} />
          <InfoItem icon={Hash} label="Type" value={profile.company_type} />
          <InfoItem icon={MapPin} label="Location" value={`${profile.city || ''}, ${profile.country || ''}`.replace(/^, |, $/, '')} />
          <InfoItem icon={Globe} label="Website" value={profile.website} />
          <InfoItem icon={Globe} label="Business Sector" value={profile.business_sector} />
        </motion.div>
      </div>

      {/* Applied Date */}
      {profile.submitted_at && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Application submitted on {format(new Date(profile.submitted_at), 'MMMM dd, yyyy')}
        </p>
      )}

      {/* License Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <LicenseRequestModal
            programs={programs}
            onClose={() => setShowRequestModal(false)}
            onSuccess={loadData}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .partner-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
