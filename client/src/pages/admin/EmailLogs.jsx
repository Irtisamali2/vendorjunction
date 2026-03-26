import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mail, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

function SkeletonRow() {
  return (
    <tr>
      {[180, 200, 120, 70, 120].map((w, i) => (
        <td key={i}>
          <div className="skeleton" style={{ width: `${w}px`, height: '14px' }} />
        </td>
      ))}
    </tr>
  )
}

export default function EmailLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const limit = 15

  const fetchLogs = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit })
    if (statusFilter) params.set('status', statusFilter)
    api.get(`/api/email/logs?${params}`)
      .then((res) => {
        setLogs(res.data.logs || res.data.data || [])
        setTotal(res.data.total || 0)
      })
      .catch(() => toast.error('Failed to load email logs'))
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
            Email Logs
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {total} email{total !== 1 ? 's' : ''} in log
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        className="card"
        style={{ padding: '0', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Subject</th>
                <th>Template</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <Mail size={36} />
                      <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)' }}>No email logs found</p>
                      {statusFilter && <p>Try removing the status filter</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={log.id || i}
                    style={{
                      background: log.status === 'failed' ? 'rgba(239,68,68,0.03)' : undefined,
                    }}
                  >
                    <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      {log.to_email || log.recipient}
                    </td>
                    <td style={{
                      maxWidth: '220px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {log.subject}
                    </td>
                    <td>
                      {log.template_type ? (
                        <span style={{
                          fontSize: '11px', padding: '3px 8px',
                          background: 'var(--accent-primary-light)',
                          borderRadius: '6px', color: 'var(--accent-primary)',
                          fontFamily: 'monospace',
                        }}>
                          {log.template_type}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <StatusBadge status={log.status} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {log.created_at ? format(new Date(log.created_at), 'MMM dd, yyyy HH:mm') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 7) pageNum = i + 1
            else if (page <= 4) pageNum = i + 1
            else if (page >= totalPages - 3) pageNum = totalPages - 6 + i
            else pageNum = page - 3 + i
            return (
              <button
                key={pageNum}
                className={`page-btn${pageNum === page ? ' active' : ''}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
