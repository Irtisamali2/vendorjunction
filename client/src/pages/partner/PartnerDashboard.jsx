import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle, Clock, XCircle, PauseCircle,
  User, Building2, MapPin, Mail, Phone,
  Globe, Briefcase, BookOpen, Hash
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    title: 'Application Under Review',
    message: 'Your application has been received and is being reviewed by our team. You will receive an email notification once a decision has been made. This typically takes 3-5 business days.',
  },
  approved: {
    icon: CheckCircle,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    title: 'Application Approved',
    message: 'Congratulations! Your application has been approved. You are now an official VendorJunction partner. Access your programs and resources below.',
  },
  rejected: {
    icon: XCircle,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    title: 'Application Not Approved',
    message: 'Unfortunately, your application did not meet the requirements at this time. Please review the feedback below and contact support if you have any questions.',
  },
  suspended: {
    icon: PauseCircle,
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.3)',
    title: 'Account Suspended',
    message: 'Your partner account has been temporarily suspended. Please contact support for more information.',
  },
}

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={15} color="var(--text-muted)" />
      </div>
      <div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{value}</div>
      </div>
    </div>
  )
}

export default function PartnerDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/partners/me/profile'),
      // programs loaded after we get the partner id
    ])
      .then(async ([profileRes]) => {
        const p = profileRes.data.data || profileRes.data
        setProfile(p)
        if (p?.id && p?.status === 'approved') {
          try {
            const progRes = await api.get(`/api/programs/${p.id}`)
            setPrograms(progRes.data.data || [])
          } catch {}
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="card">
        <div className="empty-state">
          <User size={40} />
          <p>Profile not found</p>
        </div>
      </div>
    )
  }

  const statusConf = STATUS_CONFIG[profile.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConf.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Welcome back, {profile.first_name}!
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Here is your partner portal overview
        </p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          padding: '24px',
          background: statusConf.bg,
          border: `1px solid ${statusConf.border}`,
          borderRadius: '16px',
          display: 'flex', alignItems: 'flex-start', gap: '16px',
        }}
      >
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: statusConf.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <StatusIcon size={24} color={statusConf.color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {statusConf.title}
            </h3>
            <span className={`badge badge-${profile.status}`}>{profile.status}</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {statusConf.message}
          </p>
          {profile.rejection_reason && (
            <div style={{
              marginTop: '12px', padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger)', marginBottom: '3px' }}>
                Rejection Reason
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {profile.rejection_reason}
              </p>
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Registration Code</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: statusConf.color, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {profile.reg_code}
          </div>
        </div>
      </motion.div>

      {/* Two-column info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Contact Info */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
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

        {/* Company Info */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
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

      {/* Programs (if approved) */}
      {profile.status === 'approved' && programs.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={17} color="var(--success)" />
              <div className="card-title">Your Programs</div>
            </div>
          </div>
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
                {programs.map((prog) => (
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

      {/* Applied Date */}
      {profile.submitted_at && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Application submitted on {format(new Date(profile.submitted_at), 'MMMM dd, yyyy')}
        </p>
      )}
    </div>
  )
}
