import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle, Clock, XCircle, PauseCircle,
  User, Building2, MapPin, Mail, Phone, Globe, Briefcase, Hash,
  BookOpen, TrendingUp, FileText, DollarSign,
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending: {
    icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)',
    title: 'Application Under Review',
    message: 'Your application has been received and is being reviewed. You will be notified within 3–5 business days.',
  },
  approved: {
    icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)',
    title: 'Application Approved',
    message: 'You are an official VendorJunction partner. Use the License Requests section to request licenses for your programs.',
  },
  rejected: {
    icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
    title: 'Application Not Approved',
    message: 'Your application did not meet the requirements at this time. Please review the feedback below.',
  },
  suspended: {
    icon: PauseCircle, color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)',
    title: 'Account Suspended',
    message: 'Your partner account has been temporarily suspended. Please contact support.',
  },
}

function StatCard({ icon: Icon, label, value, sub, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      style={{
        padding: '20px 22px', background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)', borderRadius: '14px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}
    >
      <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={21} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color, marginTop: '2px', fontWeight: '600' }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '11px 0', borderBottom: '1px solid var(--border-default)' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} color="var(--text-muted)" />
      </div>
      <div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{value}</div>
      </div>
    </div>
  )
}

export default function PartnerDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [programs, setPrograms] = useState([])
  const [licenseStats, setLicenseStats] = useState({ pending: 0, approved: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await api.get('/api/partners/me/profile')
        const p = profileRes.data.data || profileRes.data
        setProfile(p)

        if (p?.id && p?.status === 'approved') {
          const [progRes, lrRes] = await Promise.all([
            api.get(`/api/programs/${p.id}`),
            api.get('/api/license-requests/my'),
          ])
          const progs = progRes.data.data || []
          const lrs = lrRes.data.data || []
          setPrograms(progs)
          setLicenseStats({
            pending: lrs.filter(r => r.status === 'pending').length,
            approved: lrs.filter(r => r.status === 'approved').length,
            total: lrs.length,
          })
        }
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}><div className="spinner" /></div>
  if (!profile) return <div className="card"><div className="empty-state"><User size={40} /><p>Profile not found</p></div></div>

  const statusConf = STATUS_CONFIG[profile.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConf.icon
  const isApproved = profile.status === 'approved'

  const totalCredits = programs.reduce((s, p) => s + Number(p.credits), 0)
  const totalValue = programs.reduce((s, p) => s + (Number(p.credits) * Number(p.credit_unit_price)), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '3px' }}>
          Welcome back, {profile.first_name}!
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {profile.company_name} · Partner Portal
        </p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        style={{ padding: '20px 22px', background: statusConf.bg, border: `1px solid ${statusConf.border}`, borderRadius: '14px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: statusConf.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <StatusIcon size={22} color={statusConf.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{statusConf.title}</h3>
            <span className={`badge badge-${profile.status}`}>{profile.status}</span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{statusConf.message}</p>
          {profile.rejection_reason && (
            <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--danger)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rejection Reason</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{profile.rejection_reason}</p>
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>Reg. Code</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: statusConf.color, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{profile.reg_code}</div>
        </div>
      </motion.div>

      {/* Stats — always show when approved */}
      {isApproved && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
          <StatCard delay={0.1} icon={BookOpen} label="Price Cards" value={programs.length}
            sub={programs.length === 0 ? 'None assigned yet' : null}
            color="#0D9488" bg="rgba(13,148,136,0.1)" />
          <StatCard delay={0.15} icon={TrendingUp} label="Total Credits"
            value={totalCredits > 0 ? totalCredits.toLocaleString() : '—'}
            color="#6366F1" bg="rgba(99,102,241,0.1)" />
          <StatCard delay={0.2} icon={Clock} label="Pending Requests" value={licenseStats.pending}
            color="#F59E0B" bg="rgba(245,158,11,0.1)" />
          <StatCard delay={0.25} icon={CheckCircle} label="Approved Requests" value={licenseStats.approved}
            color="#10B981" bg="rgba(16,185,129,0.1)" />
        </div>
      )}

      {/* Price Cards summary — compact, only if programs exist */}
      {isApproved && programs.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={16} color="var(--accent-gold)" />
              <div className="card-title">Your Price Cards</div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Total value: <strong style={{ color: 'var(--accent-gold)' }}>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Credits</th>
                  <th>Unit Price</th>
                  <th>Total</th>
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
        </motion.div>
      )}

      {/* Price Cards placeholder — no programs yet */}
      {isApproved && programs.length === 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          style={{ padding: '32px', textAlign: 'center' }}>
          <BookOpen size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>No Price Cards Assigned Yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your account manager will assign price cards to your account. Check back soon.</p>
        </motion.div>
      )}

      {/* Contact + Company */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="partner-info-grid">
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--accent-primary)" />
              <div className="card-title">Contact Information</div>
            </div>
          </div>
          <InfoItem icon={User} label="Full Name" value={`${profile.title || ''} ${profile.first_name} ${profile.last_name}`.trim()} />
          <InfoItem icon={Briefcase} label="Job Title" value={profile.job_title} />
          <InfoItem icon={Mail} label="Email" value={profile.email} />
          <InfoItem icon={Phone} label="Mobile" value={profile.mobile} />
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="var(--accent-gold)" />
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

      {profile.submitted_at && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Application submitted on {format(new Date(profile.submitted_at), 'MMMM dd, yyyy')}
        </p>
      )}

      <style>{`
        @media (max-width: 768px) { .partner-info-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
