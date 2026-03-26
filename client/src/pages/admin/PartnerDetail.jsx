import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft, CheckCircle, XCircle, PauseCircle,
  Plus, Pencil, Trash2, Upload, Download,
  FileText, X, Save, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../utils/api'

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '3px',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-default)',
    }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{value || '—'}</span>
    </div>
  )
}

const PROGRAMS_LIST = [
  'AI Developer', 'Data Analyst', 'Data Engineering',
  'Cloud & Cybersecurity', 'Power BI', 'Power Platform', 'Cybersecurity Essentials'
]

function ProgramModal({ program, onClose, onSave, partnerId }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: program || { program_name: '', credits: '', credit_unit_price: '' },
  })
  const credits = watch('credits')
  const unitPrice = watch('credit_unit_price')
  const total = (parseFloat(credits) || 0) * (parseFloat(unitPrice) || 0)
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (program?.id) {
        await api.put(`/api/programs/${program.id}`, { ...data, partner_id: partnerId })
        toast.success('Program updated')
      } else {
        await api.post('/api/programs', { ...data, partner_id: partnerId })
        toast.success('Program added')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save program')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="modal-header">
          <h3 className="modal-title">{program?.id ? 'Edit Program' : 'Add Program'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Program Name <span className="required">*</span></label>
              <select
                className={`form-select${errors.program_name ? ' error' : ''}`}
                {...register('program_name', { required: 'Program name is required' })}
                defaultValue={program?.program_name || ''}
              >
                <option value="" disabled>Select program</option>
                {PROGRAMS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.program_name && <span className="form-error">{errors.program_name.message}</span>}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Credits <span className="required">*</span></label>
                <input
                  className={`form-input${errors.credits ? ' error' : ''}`}
                  type="number" min="1" placeholder="100"
                  {...register('credits', { required: 'Credits required', min: { value: 1, message: 'Min 1' } })}
                />
                {errors.credits && <span className="form-error">{errors.credits.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price (USD) <span className="required">*</span></label>
                <input
                  className={`form-input${errors.credit_unit_price ? ' error' : ''}`}
                  type="number" min="0" step="0.01" placeholder="10.00"
                  {...register('credit_unit_price', { required: 'Unit price required', min: { value: 0, message: 'Min 0' } })}
                />
                {errors.credit_unit_price && <span className="form-error">{errors.credit_unit_price.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Total Price (USD)</label>
              <input
                className="form-input"
                value={total ? `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                readOnly
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-surface-2)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><Save size={15} /> Save</>}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function ConfirmModal({ title, message, onConfirm, onClose, variant = 'danger' }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal" style={{ maxWidth: '400px' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 20px',
            background: variant === 'danger' ? 'var(--danger-light)' : variant === 'warning' ? 'var(--warning-light)' : 'var(--success-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertCircle size={26} color={variant === 'danger' ? 'var(--danger)' : variant === 'warning' ? 'var(--warning)' : 'var(--success)'} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>{message}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className={`btn btn-${variant === 'success' ? 'success' : variant === 'warning' ? 'warning' : 'danger'}`}
              disabled={loading}
              onClick={async () => {
                setLoading(true)
                await onConfirm()
                setLoading(false)
              }}
            >
              {loading ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : 'Confirm'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function RejectModal({ onClose, onConfirm }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    await onConfirm(data.reason)
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Reject Application</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Please provide a reason for rejection. This will be sent to the partner via email.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason <span className="required">*</span></label>
              <textarea
                className={`form-textarea${errors.reason ? ' error' : ''}`}
                placeholder="Explain why this application is being rejected..."
                rows={4}
                {...register('reason', { required: 'Rejection reason is required', minLength: { value: 10, message: 'Please provide a detailed reason (min 10 characters)' } })}
              />
              {errors.reason && <span className="form-error">{errors.reason.message}</span>}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-danger" disabled={loading}>
                {loading ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><XCircle size={15} /> Reject</>}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function PartnerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [partner, setPartner] = useState(null)
  const [programs, setPrograms] = useState([])
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(null) // 'approve' | 'reject' | 'suspend' | 'add-program' | 'edit-program'
  const [editingProgram, setEditingProgram] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const fetchAll = async () => {
    try {
      const [pRes, prRes, atRes] = await Promise.all([
        api.get(`/api/partners/${id}`),
        api.get(`/api/programs/${id}`),
        api.get(`/api/attachments/${id}`),
      ])
      setPartner(pRes.data.data || pRes.data)
      setPrograms(prRes.data.data || [])
      setAttachments(atRes.data.data || [])
    } catch {
      toast.error('Failed to load partner data')
      navigate('/admin/partners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleStatusChange = async (status, reason = null) => {
    try {
      const body = { status }
      if (reason) body.rejection_reason = reason
      await api.patch(`/api/partners/${id}/status`, body)
      toast.success(`Partner ${status} successfully`)
      setModal(null)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed')
    }
  }

  const handleDeleteProgram = async (programId) => {
    try {
      await api.delete(`/api/programs/${programId}`)
      toast.success('Program removed')
      fetchAll()
    } catch {
      toast.error('Failed to delete program')
    }
  }

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingFile(true)
    const formData = new FormData()
    for (const file of files) formData.append('files', file)
    try {
      await api.post(`/api/attachments/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Files uploaded')
      fetchAll()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  const handleDeleteAttachment = async (attId) => {
    try {
      await api.delete(`/api/attachments/${attId}`)
      toast.success('Attachment deleted')
      fetchAll()
    } catch {
      toast.error('Failed to delete attachment')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!partner) return null

  const status = partner.status

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/admin/partners')}
            style={{ gap: '6px' }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {partner.company_name}
              </h2>
              <StatusBadge status={status} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {partner.reg_code}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Applied: {partner.submitted_at ? format(new Date(partner.submitted_at), 'MMMM dd, yyyy') : '-'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {status !== 'approved' && (
            <button className="btn btn-success btn-sm" onClick={() => setModal('approve')}>
              <CheckCircle size={15} /> Approve
            </button>
          )}
          {status !== 'rejected' && (
            <button className="btn btn-danger btn-sm" onClick={() => setModal('reject')}>
              <XCircle size={15} /> Reject
            </button>
          )}
          {status !== 'suspended' && status !== 'rejected' && (
            <button className="btn btn-warning btn-sm" onClick={() => setModal('suspend')}>
              <PauseCircle size={15} /> Suspend
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="partner-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Contact Information</div>
            </div>
            <InfoRow label="Full Name" value={`${partner.title || ''} ${partner.first_name} ${partner.last_name}`} />
            <InfoRow label="Job Title" value={partner.job_title} />
            <InfoRow label="Email" value={partner.email} />
            <InfoRow label="Mobile" value={partner.mobile} />
          </div>

          {/* Business Details */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Business Details</div>
            </div>
            <InfoRow label="Business Sector" value={partner.business_sector} />
            <InfoRow label="Business Activities" value={partner.business_activities} />
            <InfoRow label="Registration Number" value={partner.company_reg_no} />
            <InfoRow label="Annual Turnover (USD)" value={partner.annual_turnover ? `$${Number(partner.annual_turnover).toLocaleString()}` : null} />
            {partner.rejection_reason && (
              <div style={{
                marginTop: '12px', padding: '12px',
                background: 'var(--danger-light)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
              }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger)', marginBottom: '4px' }}>Rejection Reason</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{partner.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Attachments</div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
              >
                {uploadingFile ? (
                  <div style={{ width: '14px', height: '14px', border: '2px solid var(--border-default)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : <Upload size={14} />}
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            {attachments.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px' }}>
                <FileText size={32} />
                <p>No attachments uploaded</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attachments.map((att) => (
                  <div key={att.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                  }}>
                    <FileText size={16} color="var(--text-muted)" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.original_name || att.filename}
                      </div>
                      {att.size && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatFileSize(att.size)}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {att.url && (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Download size={13} />
                        </a>
                      )}
                      <button
                        className="btn btn-icon btn-sm"
                        style={{ color: 'var(--danger)', border: '1px solid var(--border-default)' }}
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Company Information */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Company Information</div>
            </div>
            <InfoRow label="Company Name" value={partner.company_name} />
            <InfoRow label="Company Type" value={partner.company_type} />
            <InfoRow label="Address" value={[partner.address_line1, partner.address_line2].filter(Boolean).join(', ')} />
            <InfoRow label="City / Country" value={`${partner.city || ''}, ${partner.country || ''}`} />
            <InfoRow label="No. of Branches" value={partner.num_branches} />
            <InfoRow label="No. of Employees" value={partner.num_employees} />
            <InfoRow label="Landline" value={partner.landline} />
            <InfoRow label="Website" value={partner.website ? <a href={partner.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)' }}>{partner.website}</a> : null} />
          </div>

          {/* Programs */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Programs & Pricing</div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { setEditingProgram(null); setModal('add-program') }}
              >
                <Plus size={14} /> Add Program
              </button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Credits</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {programs.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state" style={{ padding: '24px' }}>
                          <p style={{ fontSize: '13px' }}>No programs assigned yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    programs.map((prog) => (
                      <tr key={prog.id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '13px' }}>
                          {prog.program_name}
                        </td>
                        <td style={{ fontSize: '13px' }}>{prog.credits}</td>
                        <td style={{ fontSize: '13px' }}>${Number(prog.credit_unit_price).toFixed(2)}</td>
                        <td style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-gold)' }}>
                          ${(prog.credits * prog.credit_unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => { setEditingProgram(prog); setModal('edit-program') }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              className="btn btn-icon btn-sm"
                              style={{ color: 'var(--danger)', border: '1px solid var(--border-default)' }}
                              onClick={() => handleDeleteProgram(prog.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'approve' && (
          <ConfirmModal
            title="Approve Partner"
            message={`Are you sure you want to approve ${partner.company_name}? They will be notified via email.`}
            variant="success"
            onClose={() => setModal(null)}
            onConfirm={() => handleStatusChange('approved')}
          />
        )}
        {modal === 'reject' && (
          <RejectModal
            onClose={() => setModal(null)}
            onConfirm={(reason) => handleStatusChange('rejected', reason)}
          />
        )}
        {modal === 'suspend' && (
          <ConfirmModal
            title="Suspend Partner"
            message={`Are you sure you want to suspend ${partner.company_name}?`}
            variant="warning"
            onClose={() => setModal(null)}
            onConfirm={() => handleStatusChange('suspended')}
          />
        )}
        {(modal === 'add-program' || modal === 'edit-program') && (
          <ProgramModal
            program={modal === 'edit-program' ? editingProgram : null}
            partnerId={id}
            onClose={() => setModal(null)}
            onSave={fetchAll}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .partner-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
