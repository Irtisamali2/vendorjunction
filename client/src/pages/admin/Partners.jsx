import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, X, Building2, MapPin, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../utils/api'

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="skeleton" style={{ width: '140px', height: '20px' }} />
        <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '20px' }} />
      </div>
      {[100, 130, 110].map((w, i) => (
        <div key={i} className="skeleton" style={{ width: `${w}px`, height: '14px', marginBottom: '8px' }} />
      ))}
    </div>
  )
}

export default function Partners() {
  const navigate = useNavigate()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 12

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [companyTypeFilter, setCompanyTypeFilter] = useState('')
  const [sectorFilter, setSectorFilter] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchPartners = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (companyTypeFilter) params.set('company_type', companyTypeFilter)
    if (sectorFilter) params.set('business_sector', sectorFilter)

    api.get(`/api/partners?${params}`)
      .then((res) => {
        setPartners(res.data.partners || res.data.data || [])
        setTotal(res.data.total || 0)
      })
      .catch(() => { setPartners([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [page, search, statusFilter, companyTypeFilter, sectorFilter])

  useEffect(() => { fetchPartners() }, [fetchPartners])

  const totalPages = Math.ceil(total / limit)

  const clearFilters = () => {
    setSearchInput(''); setSearch('')
    setStatusFilter(''); setCompanyTypeFilter(''); setSectorFilter('')
    setPage(1)
  }

  const hasFilters = search || statusFilter || companyTypeFilter || sectorFilter

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>All Partners</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {total} partner{total !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            className="form-input"
            style={{ paddingLeft: '38px', paddingRight: searchInput ? '36px' : '14px' }}
            placeholder="Search by name, company, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status */}
        <select
          className="form-select"
          style={{ width: '160px', minWidth: '140px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Statuses</option>
          {['pending', 'approved', 'rejected', 'suspended'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        {/* Company Type */}
        <select
          className="form-select"
          style={{ width: '180px', minWidth: '150px' }}
          value={companyTypeFilter}
          onChange={(e) => { setCompanyTypeFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Types</option>
          {['Private Limited', 'Public Limited', 'Sole Proprietorship', 'Partnership', 'LLC', 'FZC', 'FZE', 'Other'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Sector */}
        <select
          className="form-select"
          style={{ width: '200px', minWidth: '160px' }}
          value={sectorFilter}
          onChange={(e) => { setSectorFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Sectors</option>
          {['Information Technology', 'Education', 'EdTech', 'Training', 'Marketing Services', 'Distribution', 'Consulting', 'Other'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ whiteSpace: 'nowrap' }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : partners.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Building2 size={40} />
            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>No partners found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {partners.map((partner, i) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              onClick={() => navigate(`/admin/partners/${partner.id}`)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '14px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              whileHover={{
                borderColor: 'var(--accent-primary)',
                boxShadow: '0 0 20px rgba(99,102,241,0.15)',
                y: -2,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {partner.company_name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {partner.title} {partner.first_name} {partner.last_name}
                  </p>
                </div>
                <StatusBadge status={partner.status} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <MapPin size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {partner.city}, {partner.country}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Mail size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {partner.email}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Calendar size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {partner.submitted_at ? format(new Date(partner.submitted_at), 'MMM dd, yyyy') : '-'}
                  </span>
                </div>
              </div>

              {partner.company_type && (
                <div style={{
                  marginTop: '12px', paddingTop: '12px',
                  borderTop: '1px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Building2 size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {partner.company_type} · {partner.business_sector}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

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
