import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { Mail, Pencil, X, Save, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { Editor } from '@tinymce/tinymce-react'
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/code'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/table'
import 'tinymce/plugins/wordcount'
import 'tinymce/skins/ui/oxide-dark/skin.min.css'
import 'tinymce/skins/content/dark/content.min.css'
import api from '../../utils/api'

const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY || ''

const TEMPLATE_META = {
  registration_welcome: {
    label: 'Registration Welcome',
    hints: ['{{first_name}}', '{{last_name}}', '{{company_name}}', '{{email}}', '{{submitted_date}}'],
    bg: 'rgba(13,148,136,0.12)', color: '#0D9488',
  },
  status_approved: {
    label: 'Application Approved',
    hints: ['{{first_name}}', '{{last_name}}', '{{company_name}}', '{{email}}', '{{temp_password}}', '{{portal_url}}'],
    bg: 'rgba(16,185,129,0.12)', color: '#10B981',
  },
  status_rejected: {
    label: 'Application Rejected',
    hints: ['{{first_name}}', '{{last_name}}', '{{company_name}}', '{{rejection_reason}}'],
    bg: 'rgba(239,68,68,0.12)', color: '#EF4444',
  },
}

function EditModal({ template, onClose, onSave }) {
  const key = template.template_key
  const meta = TEMPLATE_META[key] || {}

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      template_name: template.template_name || '',
      subject: template.subject || '',
      html_body: template.html_body || '',
    },
  })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await api.put(`/api/email/templates/${template.id}`, data)
      toast.success('Template saved!')
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal"
        style={{ maxWidth: '720px', width: '100%' }}
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.22 }}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Edit Template</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {meta.label || key}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Variable hints */}
        {meta.hints && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '12px 14px', marginBottom: '20px',
            background: 'rgba(13,148,136,0.08)',
            borderRadius: '10px', border: '1px solid rgba(13,148,136,0.2)',
          }}>
            <Info size={15} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '6px' }}>
                Available Variables — copy and paste into subject or body
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {meta.hints.map(v => (
                  <code key={v} style={{
                    fontSize: '11px', padding: '3px 8px',
                    background: 'rgba(13,148,136,0.15)', borderRadius: '4px',
                    color: '#A5B4FC', fontFamily: 'monospace', cursor: 'pointer',
                  }}
                    onClick={() => { navigator.clipboard?.writeText(v); toast.success(`Copied ${v}`) }}
                  >{v}</code>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Template Name</label>
              <input className="form-input" {...register('template_name')} />
            </div>

            <div className="form-group">
              <label className="form-label">Subject Line <span className="required">*</span></label>
              <input
                className={`form-input${errors.subject ? ' error' : ''}`}
                placeholder="Email subject line..."
                {...register('subject', { required: 'Subject is required' })}
              />
              {errors.subject && <span className="form-error">{errors.subject.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">HTML Body <span className="required">*</span></label>
              <div className={`email-editor-wrap${errors.html_body ? ' error' : ''}`}>
                <Controller
                  name="html_body"
                  control={control}
                  rules={{
                    required: 'Body is required',
                    validate: (value) => {
                      const textOnly = (value || '')
                        .replace(/<[^>]*>/g, ' ')
                        .replace(/&nbsp;/g, ' ')
                        .trim()
                      return textOnly.length > 0 || 'Body is required'
                    },
                  }}
                  render={({ field }) => (
                    <Editor
                      apiKey={TINYMCE_API_KEY}
                      value={field.value || ''}
                      onEditorChange={field.onChange}
                      init={{
                        license_key: 'gpl',
                        height: 360,
                        menubar: true,
                        statusbar: true,
                        branding: false,
                        promotion: false,
                        skin: false,
                        content_css: false,
                        plugins: [
                          'autolink', 'charmap', 'code', 'image', 'link', 'lists', 'preview', 'searchreplace', 'table', 'wordcount',
                        ],
                        toolbar:
                          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | removeformat code preview',
                        image_title: true,
                        automatic_uploads: true,
                        paste_data_images: true,
                        file_picker_types: 'image',
                        file_picker_callback: (callback, value, meta) => {
                          if (meta.filetype !== 'image') return

                          const input = document.createElement('input')
                          input.setAttribute('type', 'file')
                          input.setAttribute('accept', 'image/*')

                          input.onchange = function onFileChange() {
                            const file = input.files?.[0]
                            if (!file) return

                            const reader = new FileReader()
                            reader.onload = function onFileLoad() {
                              callback(reader.result, { title: file.name })
                            }
                            reader.readAsDataURL(file)
                          }

                          input.click()
                        },
                        content_style:
                          'body { background: #0f172a; color: #f8fafc; font-family: Inter, Arial, sans-serif; font-size: 14px; } a { color: #818cf8; }',
                      }}
                    />
                  )}
                />
              </div>
              {errors.html_body && <span className="form-error">{errors.html_body.message}</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <><Save size={15} /> Save Template</>}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState(null)

  const fetchTemplates = () => {
    setLoading(true)
    api.get('/api/email/templates')
      .then((res) => {
        // API returns { success, data: [...] }
        const list = Array.isArray(res.data.data) ? res.data.data
          : Array.isArray(res.data) ? res.data : []
        setTemplates(list)
      })
      .catch(() => toast.error('Failed to load templates'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTemplates() }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Email Templates
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Customize the automated emails sent to partners at each stage
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Mail size={40} />
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)' }}>No templates found</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Make sure the database seed ran correctly</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {templates.map((tmpl, i) => {
            const key = tmpl.template_key
            const meta = TEMPLATE_META[key] || { label: key, hints: [], bg: 'var(--bg-surface)', color: 'var(--text-muted)' }
            return (
              <motion.div
                key={tmpl.id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: meta.bg, border: `1px solid ${meta.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Mail size={18} color={meta.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {tmpl.template_name || meta.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {key}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: tmpl.is_active ? '#10B981' : '#64748B',
                    flexShrink: 0, marginTop: '6px',
                  }} title={tmpl.is_active ? 'Active' : 'Inactive'} />
                </div>

                {tmpl.subject && (
                  <div style={{
                    padding: '10px 12px', background: 'var(--bg-surface)',
                    borderRadius: '8px', marginBottom: '14px', border: '1px solid var(--border-default)',
                  }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>Subject</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tmpl.subject}
                    </p>
                  </div>
                )}

                {meta.hints.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                    {meta.hints.slice(0, 4).map(v => (
                      <code key={v} style={{
                        fontSize: '10px', padding: '2px 6px',
                        background: 'rgba(13,148,136,0.1)', borderRadius: '4px',
                        color: '#A5B4FC', fontFamily: 'monospace',
                      }}>{v}</code>
                    ))}
                    {meta.hints.length > 4 && (
                      <code style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(13,148,136,0.1)', borderRadius: '4px', color: '#64748B', fontFamily: 'monospace' }}>
                        +{meta.hints.length - 4} more
                      </code>
                    )}
                  </div>
                )}

                <button
                  className="btn btn-ghost"
                  style={{ width: '100%' }}
                  onClick={() => setEditingTemplate(tmpl)}
                >
                  <Pencil size={14} /> Edit Template
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {editingTemplate && (
          <EditModal
            template={editingTemplate}
            onClose={() => setEditingTemplate(null)}
            onSave={fetchTemplates}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
