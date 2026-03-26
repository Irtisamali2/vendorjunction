import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Settings, Send, Eye, EyeOff, Save, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../utils/api'

export default function EmailConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    api.get('/api/email/config')
      .then((res) => {
        reset(res.data.data || {})
      })
      .catch(() => toast.error('Failed to load email config'))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await api.put('/api/email/config', data)
      toast.success('Email configuration saved successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) { toast.error('Please enter a test email address'); return }
    setTesting(true)
    try {
      await api.post('/api/email/test', { test_email: testEmail })
      toast.success(`Test email sent to ${testEmail}!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* SMTP Config */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--accent-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Settings size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <div className="card-title">SMTP Configuration</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                Configure outgoing email server settings
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">SMTP Host <span className="required">*</span></label>
                <input
                  className={`form-input${errors.smtp_host ? ' error' : ''}`}
                  placeholder="smtp.gmail.com"
                  {...register('smtp_host', { required: 'SMTP host is required' })}
                />
                {errors.smtp_host && <span className="form-error">{errors.smtp_host.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">SMTP Port <span className="required">*</span></label>
                <input
                  className={`form-input${errors.smtp_port ? ' error' : ''}`}
                  type="number"
                  placeholder="587"
                  {...register('smtp_port', { required: 'Port is required' })}
                />
                {errors.smtp_port && <span className="form-error">{errors.smtp_port.message}</span>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Username <span className="required">*</span></label>
                <input
                  className={`form-input${errors.smtp_user ? ' error' : ''}`}
                  placeholder="noreply@yourcompany.com"
                  {...register('smtp_user', { required: 'Username is required' })}
                />
                {errors.smtp_user && <span className="form-error">{errors.smtp_user.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    className={`form-input${errors.smtp_password ? ' error' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    style={{ paddingRight: '44px' }}
                    {...register('smtp_password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.smtp_password && <span className="form-error">{errors.smtp_password.message}</span>}
              </div>
            </div>

            <div className="form-group" style={{ maxWidth: '240px' }}>
              <label className="form-label">Encryption</label>
              <select className="form-select" {...register('smtp_encryption')}>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>

            <div style={{ height: '1px', background: 'var(--border-default)', margin: '4px 0' }} />

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">From Name</label>
                <input
                  className="form-input"
                  placeholder="VendorJunction"
                  {...register('from_name')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">From Email <span className="required">*</span></label>
                <input
                  className={`form-input${errors.from_email ? ' error' : ''}`}
                  type="email"
                  placeholder="noreply@vendorjunction.com"
                  {...register('from_email', {
                    required: 'From email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                />
                {errors.from_email && <span className="form-error">{errors.from_email.message}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: '140px' }}>
                {saving ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : <><Save size={16} /> Save Configuration</>}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Test Email */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--success-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wifi size={18} color="var(--success)" />
            </div>
            <div>
              <div className="card-title">Test Email</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                Send a test email to verify your configuration
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Recipient Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <button
            className="btn btn-success"
            onClick={handleTestEmail}
            disabled={testing}
            style={{ minWidth: '140px', height: '44px' }}
          >
            {testing ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : <><Send size={15} /> Send Test</>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
