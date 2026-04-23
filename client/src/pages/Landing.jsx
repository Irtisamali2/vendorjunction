import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Globe, Shield, Award, Briefcase, GraduationCap,
  CheckCircle, ChevronRight, Users, MapPin, BookOpen, TrendingUp, Menu, X,
} from 'lucide-react'

/* ─── Animated stat counter ─── */
function StatCounter({ value, suffix, active }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1800, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(ease * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, value])
  return <>{count.toLocaleString()}{suffix}</>
}

const FF = "'Segoe UI', 'Source Sans 3', system-ui, sans-serif"

const STYLES = `
  * { box-sizing: border-box; }

  .l-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 76px;
    background: rgba(255,255,255,0.98);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #E8EDF3;
    display: flex; align-items: center;
    padding: 0 32px;
    gap: 0;
    font-family: ${FF};
  }
  .l-nav-left { display: flex; align-items: center; gap: 11px; flex-shrink: 0; }
  .l-nav-center {
    flex: 1;
    display: flex; align-items: center; gap: 16px;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
  }
  .l-nav-divider { width: 1px; height: 32px; background: #E8EDF3; flex-shrink: 0; }
  .l-nav-right { margin-left: 0; padding-left: 16px; display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
  .l-nav-spacer { flex: 1; }

  /* ── HERO ── */
  .l-hero {
    padding-top: 130px; padding-bottom: 72px;
    background: #FFFFFF;
    border-bottom: 1px solid #F1F5F9;
  }
  .l-hero-inner {
    max-width: 1080px; margin: 0 auto; padding: 0 48px;
  }

  /* ── COLLAB STRIP (inside hero, below copy) ── */
  .l-collab-strip {
    margin-top: 52px;
    padding-top: 36px;
    border-top: 1px solid #F1F5F9;
    display: flex; align-items: center; gap: 40px; flex-wrap: wrap;
  }
  .l-collab-label {
    font-size: 10px; font-weight: 700; color: #94A3B8;
    letter-spacing: 0.14em; text-transform: uppercase;
    flex-shrink: 0;
  }
  .l-collab-logos { display: flex; align-items: center; gap: 36px; flex-wrap: wrap; }
  .l-collab-sep { width: 1px; height: 28px; background: #E8EDF3; flex-shrink: 0; }

  /* ── STATS ── */
  .l-stats { background: #0D9488; }
  .l-stats-inner {
    max-width: 1080px; margin: 0 auto; padding: 0 48px;
    display: flex; flex-wrap: wrap;
  }
  .l-stat-cell {
    flex: 1; min-width: 180px;
    padding: 36px 32px;
    display: flex; align-items: center; gap: 16px;
  }
  .l-stat-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(255,255,255,0.14);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* ── PROGRAMS ── */
  .l-programs { background: #F8FAFC; padding: 88px 0; }
  .l-programs-inner { max-width: 1080px; margin: 0 auto; padding: 0 48px; }
  .l-programs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
    margin-top: 44px;
  }
  .l-card {
    background: #FFFFFF;
    border: 1px solid #E8EDF3;
    border-radius: 14px;
    overflow: hidden;
    transition: box-shadow 0.22s, transform 0.22s, border-color 0.22s;
    cursor: default;
  }
  .l-card:hover {
    box-shadow: 0 8px 36px rgba(13,148,136,0.13);
    border-color: #5EEAD4;
    transform: translateY(-4px);
  }
  .l-card-img { aspect-ratio: 4 / 3; width: 100%; overflow: hidden; position: relative; background: #E8EDF3; }
  .l-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; display: block; }
  .l-card:hover .l-card-img img { transform: scale(1.04); }
  .l-card-badge {
    position: absolute; top: 10px; left: 10px;
    color: white; font-size: 9px; font-weight: 800;
    padding: 3px 9px; border-radius: 100px;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .l-card-body { padding: 18px 20px 22px; }
  .l-card-title { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 7px; }
  .l-card-desc { font-size: 13px; color: #64748B; line-height: 1.65; }

  /* ── PARTNERSHIP / BENEFITS ── */
  .l-partner { background: #FFFFFF; padding: 88px 0; border-top: 1px solid #F1F5F9; }
  .l-partner-inner { max-width: 1080px; margin: 0 auto; padding: 0 48px; }
  .l-partner-grid {
    margin-top: 48px;
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 64px;
    align-items: center;
  }
  .l-benefit-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .l-benefit-item {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px;
    background: #FFFFFF;
    border: 1px solid #E8EDF3;
    border-left: 3px solid #0D9488;
    border-radius: 8px;
    font-size: 13.5px; color: #1E293B; font-weight: 500;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .l-benefit-item:hover {
    background: #F0FDFB;
    box-shadow: 0 2px 10px rgba(13,148,136,0.08);
  }

  /* ── FOOTER ── */
  .l-footer {
    background: #F8FAFC; border-top: 1px solid #E8EDF3;
    padding: 24px 48px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
    font-size: 12.5px; color: #94A3B8;
    font-family: ${FF};
  }
  .l-footer a { color: #94A3B8; text-decoration: none; transition: color 0.15s; }
  .l-footer a:hover { color: #0F172A; }

  /* ── SECTION BADGE ── */
  .l-badge {
    display: inline-block;
    font-size: 10.5px; font-weight: 700; color: #0D9488;
    letter-spacing: 0.12em; text-transform: uppercase;
    background: rgba(13,148,136,0.08);
    padding: 4px 13px; border-radius: 100px;
    border: 1px solid rgba(13,148,136,0.18);
    margin-bottom: 13px;
  }
  .l-section-h2 {
    font-size: clamp(26px, 3vw, 38px);
    font-weight: 800; color: #0F172A;
    letter-spacing: -0.03em; line-height: 1.15;
    margin-bottom: 10px;
  }
  .l-section-sub { font-size: 15.5px; color: #64748B; line-height: 1.8; }

  /* ── BUTTONS ── */
  .l-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    background: #0D9488; border: none; color: white;
    font-size: 14px; font-weight: 600;
    padding: 12px 28px; border-radius: 8px;
    cursor: pointer; font-family: ${FF};
    box-shadow: 0 3px 12px rgba(13,148,136,0.3);
    transition: all 0.18s; text-decoration: none;
  }
  .l-btn-primary:hover { background: #0F766E; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(13,148,136,0.35); }
  .l-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    background: transparent; border: 1.5px solid #E2E8F0; color: #334155;
    font-size: 14px; font-weight: 600;
    padding: 12px 28px; border-radius: 8px;
    cursor: pointer; font-family: ${FF}; transition: all 0.18s;
  }
  .l-btn-ghost:hover { border-color: #0D9488; color: #0D9488; }

  /* ─── Hamburger menu ─── */
  .l-hamburger {
    display: none;
    background: none; border: none; cursor: pointer;
    padding: 8px; border-radius: 8px;
    color: #334155;
    transition: background 0.15s;
    margin-left: auto;
    flex-shrink: 0;
  }
  .l-hamburger:hover { background: #F1F5F9; }

  .l-mobile-menu {
    position: fixed; top: 60px; left: 0; right: 0; z-index: 199;
    background: rgba(255,255,255,0.99);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid #E8EDF3;
    padding: 20px 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  }
  .l-mobile-menu-header {
    display: flex; align-items: center; gap: 10px;
    padding-bottom: 16px;
    border-bottom: 1px solid #F1F5F9;
    margin-bottom: 14px;
  }
  .l-mobile-menu-btns { display: flex; flex-direction: column; gap: 10px; }
  .l-mobile-menu-btns button { width: 100%; text-align: center; justify-content: center; }

  /* ════════════════ RESPONSIVE ════════════════ */

  /* Tablet */
  @media (max-width: 1024px) {
    .l-nav { padding: 0 20px; }
    .l-hero-inner, .l-stats-inner, .l-programs-inner, .l-partner-inner { padding: 0 24px; }
    .l-footer { padding: 20px 24px; }
    .l-partner-grid { grid-template-columns: 1fr; gap: 32px; }
    .l-partner-left { max-width: 100% !important; }
    .l-programs { padding: 72px 0; }
    .l-partner { padding: 72px 0; }
  }

  /* Small tablet */
  @media (max-width: 900px) {
    .l-programs-grid { grid-template-columns: repeat(2, 1fr); }
    .l-collab-logos { gap: 20px; flex-wrap: wrap; }
  }

  /* Mobile */
  @media (max-width: 640px) {
    /* NAV — logo row + hamburger on right */
    .l-nav { padding: 0 10px; height: 56px; gap: 0; }
    .l-nav-left > .l-nav-divider { display: none; }
    .l-nav-left span { display: none; }
    .l-nav-left img { height: 34px !important; }
    .l-nav-right { display: none !important; }
    .l-hamburger { display: flex !important; align-items: center; justify-content: center; }
    /* Scale down centre logos on mobile, hide dividers */
    .l-nav-center {
      position: static;
      transform: none;
      display: flex !important;
      flex: 1;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    .l-nav-center .l-nav-divider { display: none; }
    .l-nav-center > div:not(.l-nav-divider) { width: 72px !important; height: 34px !important; overflow: hidden; }
    .l-nav-center > div:not(.l-nav-divider) img { width: 72px !important; height: auto !important; }
    .l-nav-center > img { height: 22px !important; width: auto !important; object-fit: contain; }

    /* HERO */
    .l-hero { padding-top: 76px; padding-bottom: 40px; }
    .l-hero-inner { padding: 0 18px; }

    /* Announcement pill wrapping fix */
    .l-hero-inner > div:first-child {
      max-width: 100%;
      white-space: normal !important;
    }

    /* H1 */
    h1 { font-size: clamp(30px, 8vw, 44px) !important; }

    /* FEATURE TAGS — 2 per row */
    .l-feature-tags {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .l-feature-tags > span { width: 100%; justify-content: flex-start; }

    /* CTA BUTTONS — stacked on very small, side-by-side on 400+ */
    .l-cta-btns {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px;
    }
    .l-cta-btns > button {
      width: 100%;
      font-size: 14px !important;
      padding: 13px 16px !important;
      text-align: center;
      justify-content: center;
    }

    /* COLLAB STRIP — label on top, logos scrollable row */
    .l-collab-strip {
      margin-top: 28px;
      padding-top: 20px;
      gap: 12px;
      flex-direction: column;
      align-items: flex-start;
    }
    .l-collab-logos {
      display: flex !important;
      flex-direction: row !important;
      align-items: center;
      flex-wrap: nowrap;
      gap: 10px;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .l-collab-logos::-webkit-scrollbar { display: none; }
    .l-collab-logos .l-collab-kamk {
      width: 80px !important;
      height: 34px !important;
      flex-shrink: 0;
    }
    .l-collab-logos .l-collab-kamk img {
      width: 80px !important;
    }
    .l-collab-logos .l-collab-microsoft {
      height: 22px !important;
      flex-shrink: 0;
    }
    .l-collab-logos .l-collab-edukamu {
      width: 80px !important;
      height: 34px !important;
      flex-shrink: 0;
    }
    .l-collab-logos .l-collab-edukamu img {
      width: 80px !important;
    }
    .l-collab-sep { height: 20px; flex-shrink: 0; }

    /* STATS — 2-column grid, compact */
    .l-stats-inner {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
      padding: 0;
    }
    .l-stat-cell {
      padding: 20px 12px;
      gap: 10px;
      border-right: none !important;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      min-width: 0;
    }
    .l-stat-icon { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; }
    .l-stat-value { font-size: 22px !important; }
    .l-stat-label { font-size: 11px !important; line-height: 1.35; }

    /* PROGRAMS */
    .l-programs { padding: 52px 0; }
    .l-programs-inner { padding: 0 18px; }
    .l-programs-grid { grid-template-columns: 1fr; gap: 16px; margin-top: 28px; }
    .l-section-h2 { font-size: 23px !important; margin-bottom: 8px !important; }
    .l-section-sub { font-size: 14px !important; line-height: 1.7 !important; }

    /* BENEFITS */
    .l-partner { padding: 52px 0; }
    .l-partner-inner { padding: 0 18px; }
    .l-benefit-grid { grid-template-columns: 1fr; gap: 8px; }
    .l-benefit-item { font-size: 13.5px; padding: 12px 14px; }
    .l-partner-left { padding: 28px 22px !important; }
    .l-partner-left h3 { font-size: 20px !important; }

    /* FOOTER */
    .l-footer { padding: 20px 18px; flex-direction: column; align-items: flex-start; gap: 12px; font-size: 12.5px; }
    .l-footer > div:last-child { gap: 16px !important; }

    /* BADGE */
    .l-badge { font-size: 9.5px; }
  }

  /* Very small phones */
  @media (max-width: 380px) {
    .l-nav { padding: 0 12px; }
    .l-hero-inner { padding: 0 14px; }
    .l-programs-inner, .l-partner-inner { padding: 0 14px; }
    .l-footer { padding: 18px 14px; }
    .l-section-h2 { font-size: 20px !important; }
    .l-stat-value { font-size: 19px !important; }
    .l-stat-cell { padding: 16px 8px; gap: 8px; }
    .l-stat-icon { width: 30px; height: 30px; }
  }
`

export default function Landing() {
  const navigate = useNavigate()
  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStatsVisible(true)
    }, { threshold: 0.1 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const programs = [
    { name: 'Cloud & Cybersecurity', desc: 'Architect cloud environments and defend against modern cyber threats.', img: '/courses/cybersecurity.png', badge: 'Cloud & Security', badgeColor: '#2563EB' },
    { name: 'AI Developer', desc: 'Design and deploy intelligent, AI-powered solutions at enterprise scale.', img: '/courses/ai-developer.png', badge: 'Artificial Intelligence', badgeColor: '#7C3AED' },
    { name: 'Data Engineer', desc: "Build robust data pipelines that power the world's data infrastructure.", img: '/courses/data-engineer.png', badge: 'Data Infrastructure', badgeColor: '#D97706' },
    { name: 'Data Analyst', desc: 'Transform raw data into strategic insights that drive confident decisions.', img: '/courses/data-analyst.png', badge: 'Analytics & BI', badgeColor: '#059669' },
    { name: 'Power Platform BI', desc: 'Automate workflows and build powerful business intelligence dashboards.', img: '/courses/power-platform.png', badge: 'Business Intelligence', badgeColor: '#D97706' },
    { name: 'AI Agent', desc: 'Build autonomous AI agents that reason, plan, and solve complex business problems.', img: '/courses/ai-agent.png', badge: 'Autonomous AI', badgeColor: '#DC2626' },
  ]

  const benefits = [
    'Robust Partnership', 'Marketing Support',
    'Microsoft Partnership', 'Go To Market',
    'Global Credentials', 'Joint Planning',
    'Margin-Driven Revenue', 'Business Development',
    'Systems & Processes', 'Enablement & Trainings',
  ]

  const stats = [
    { value: 46, suffix: '+', label: 'Partner Organisations', Icon: Users },
    { value: 39, suffix: '', label: 'Countries Reached', Icon: MapPin },
    { value: 6, suffix: '', label: 'Microdegree Programs', Icon: BookOpen },
    { value: 70000, suffix: '+', label: 'Learners', Icon: TrendingUp },
  ]

  const featureTags = [
    { Icon: Shield, label: 'Microsoft Certified' },
    { Icon: Award, label: 'EU ECTS Credits' },
    { Icon: Globe, label: 'Accredited Program' },
    { Icon: Briefcase, label: "Int'l & Local Jobs" },
    { Icon: GraduationCap, label: 'EU University Pathway' },
  ]

  return (
    <>
      <style>{STYLES}</style>

      <div style={{ fontFamily: FF, overflowX: 'hidden', color: '#0F172A', background: '#FFFFFF' }}>

        {/* ════════════════ NAV ════════════════ */}
        <motion.nav className="l-nav"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        >
          {/* Left — logo always visible */}
          <div className="l-nav-left">
            <img src="/logos/vendorjunction.png" alt="VendorJunction" style={{ height: '44px', width: 'auto' }} />
            <div className="l-nav-divider" />
            <span style={{ fontSize: '9.5px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              PARTNER PORTAL
            </span>
          </div>

          {/* Centre logos — hidden on mobile via CSS (KAMK | Microsoft | Edukamu) */}
          <div className="l-nav-center">
            <div style={{ width: '110px', height: '54px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/logos/kamk.png" alt="KAMK University Finland" style={{ width: '110px', height: 'auto' }} />
            </div>
            <div className="l-nav-divider" />
            <img src="/logos/microsoft.png" alt="Microsoft" style={{ height: '30px', objectFit: 'contain', flexShrink: 0 }} />
            <div className="l-nav-divider" />
            <div style={{ width: '110px', height: '54px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/logos/edukamu.png" alt="Edukamu" style={{ width: '110px', height: 'auto' }} />
            </div>
          </div>

          {/* Right — desktop buttons */}
          <div className="l-nav-right">
            <button onClick={() => navigate('/admin/login')} style={{
              background: 'none', border: 'none', color: '#64748B', fontSize: '12px',
              fontWeight: '500', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
              fontFamily: FF, transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.background = '#F1F5F9' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'none' }}
            >Admin</button>
            <button onClick={() => navigate('/partner/login')} style={{
              background: 'none', border: '1.5px solid #E2E8F0', color: '#475569',
              fontSize: '12px', fontWeight: '500', padding: '6px 12px',
              borderRadius: '7px', cursor: 'pointer', fontFamily: FF, transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.color = '#0D9488' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
            >Partner Login</button>
            <button className="l-btn-primary" onClick={() => navigate('/register')} style={{ fontSize: '12px', padding: '7px 14px', whiteSpace: 'nowrap' }}>
              Become a Partner <ArrowRight size={12} />
            </button>
          </div>

          {/* Hamburger — mobile only, always on far RIGHT via margin-left: auto in CSS */}
          <button className="l-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </motion.nav>

        {/* ════════════════ MOBILE MENU ════════════════ */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div className="l-mobile-menu"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            >
              {/* Navigation Buttons */}
              <div className="l-mobile-menu-btns">
                <button onClick={() => { navigate('/admin/login'); setMenuOpen(false) }} style={{
                  background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569',
                  fontSize: '14px', fontWeight: '500', padding: '12px 20px',
                  borderRadius: '9px', cursor: 'pointer', fontFamily: FF, width: '100%',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#475569' }}
                >Admin Login</button>
                <button onClick={() => { navigate('/partner/login'); setMenuOpen(false) }} style={{
                  background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#475569',
                  fontSize: '14px', fontWeight: '500', padding: '12px 20px',
                  borderRadius: '9px', cursor: 'pointer', fontFamily: FF, width: '100%',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.color = '#0D9488' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                >Partner Login</button>
                <button className="l-btn-primary" onClick={() => { navigate('/register'); setMenuOpen(false) }}
                  style={{ fontSize: '14px', padding: '13px 20px', width: '100%', justifyContent: 'center' }}>
                  Become a Partner <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════ HERO ════════════════ */}
        <section className="l-hero">
          <div className="l-hero-inner">

            {/* Announcement pill */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              onClick={() => navigate('/register')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.2)',
                borderRadius: '100px', padding: '6px 16px 6px 8px',
                marginBottom: '28px', cursor: 'pointer',
              }}
            >
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={11} color="white" />
              </div>
              <span style={{ fontSize: '12.5px', color: '#0F766E', fontWeight: '600' }}>
                Global Partner Program Now Open – Apply Today
              </span>
              <ChevronRight size={13} color="#0D9488" />
            </motion.div>

            {/* H1 — "Microsoft Skills For Jobs" in ONE dark colour */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.5 }}
              style={{
                fontSize: 'clamp(38px, 5.5vw, 64px)',
                fontWeight: '800', lineHeight: 1.05,
                letterSpacing: '-0.04em', color: '#0F172A',
                marginBottom: '12px',
              }}
            >
              Microsoft Skills For Jobs
            </motion.h1>

            {/* Sub-label — "Microdegree Program" */}
            <motion.p
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13, duration: 0.45 }}
              style={{ fontSize: 'clamp(28px, 3.2vw, 46px)', fontWeight: '700', color: '#1E3A5F', marginBottom: '20px', letterSpacing: '-0.02em' }}
            >
              Microdegree Program
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.45 }}
              style={{ fontSize: '15.5px', color: '#475569', lineHeight: 1.85, maxWidth: '640px', marginBottom: '28px' }}
            >
              Join the global network of accredited partners delivering Microsoft-certified
              Microdegree Program certifications with EU ECTS credits in AI, Cloud & Cybersecurity,
              Data Engineering, Data Analytics, Power Platform BI and AI Agent.
            </motion.p>

            {/* Feature tags */}
            <motion.div
              className="l-feature-tags"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.45 }}
              style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}
            >
              {featureTags.map(({ Icon, label }, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '7px',
                  background: '#F8FAFC', border: '1px solid #E2E8F0',
                  fontSize: '12.5px', color: '#334155', fontWeight: '500',
                }}>
                  <Icon size={12} color="#0D9488" /> {label}
                </span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              className="l-cta-btns"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27, duration: 0.45 }}
              style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
            >
              <button className="l-btn-primary" onClick={() => navigate('/register')} style={{ fontSize: '15px', padding: '13px 32px' }}>
                Become a Partner <ArrowRight size={15} />
              </button>
              <button className="l-btn-ghost" onClick={() => navigate('/partner/login')} style={{ fontSize: '15px', padding: '13px 32px' }}>
                Partner Login
              </button>
            </motion.div>

            {/* Collaboration logos — horizontal strip */}
            <motion.div
              className="l-collab-strip"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.5 }}
            >
              <span className="l-collab-label">In Collaboration With</span>
              <div className="l-collab-logos">
                {/* KAMK first — clip canvas whitespace */}
                <div className="l-collab-kamk" style={{ width: '160px', height: '66px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/logos/kamk.png" alt="KAMK University Finland" style={{ width: '160px', height: 'auto' }} />
                </div>
                <div className="l-collab-sep" />
                <img className="l-collab-microsoft" src="/logos/microsoft.png" alt="Microsoft" style={{ height: '40px', objectFit: 'contain' }} />
                <div className="l-collab-sep" />
                <div className="l-collab-edukamu" style={{ width: '160px', height: '66px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/logos/edukamu.png" alt="Edukamu" style={{ width: '160px', height: 'auto' }} />
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ════════════════ STATS BAND ════════════════ */}
        <section className="l-stats" ref={statsRef}>
          <div className="l-stats-inner">
            {stats.map(({ value, suffix, label, Icon }, i) => (
              <div key={i} className="l-stat-cell" style={{
                borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}>
                <div className="l-stat-icon">
                  <Icon size={20} color="rgba(255,255,255,0.85)" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="l-stat-value" style={{ fontSize: '30px', fontWeight: '800', color: 'white', lineHeight: 1, fontFamily: FF }}>
                    <StatCounter value={value} suffix={suffix} active={statsVisible} />
                  </div>
                  <div className="l-stat-label" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.68)', marginTop: '4px', fontFamily: FF }}>
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════ PROGRAMS ════════════════ */}
        <section className="l-programs">
          <div className="l-programs-inner">
            <motion.div
              initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <span className="l-badge">Program Portfolio</span>
              <h2 className="l-section-h2">Microdegree Program Specialisations</h2>
              <p className="l-section-sub" style={{ maxWidth: '540px' }}>
                Industry-aligned certifications built around the most in-demand technologies,
                each accredited with EU ECTS credits.
              </p>
            </motion.div>

            <div className="l-programs-grid">
              {programs.map((p, i) => (
                <motion.div key={i} className="l-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <div className="l-card-img">
                    <img src={p.img} alt={p.name} onError={e => { e.currentTarget.style.display = 'none' }} />
                    <span className="l-card-badge" style={{ background: p.badgeColor }}>{p.badge}</span>
                  </div>
                  <div className="l-card-body">
                    <div className="l-card-title">{p.name}</div>
                    <div className="l-card-desc">{p.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ PARTNERSHIP BENEFITS ════════════════ */}
        <section className="l-partner">
          <div className="l-partner-inner">
            <motion.div
              initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <span className="l-badge">Why Partner With Us</span>
              <h2 className="l-section-h2">
                Ready to Join the Global Partners Ecosystem?
              </h2>
              <p className="l-section-sub" style={{ maxWidth: '540px' }}>
                Become an accredited delivery partner for the Microsoft Skills for Jobs Microdegree Program and
                expand your business with a structured, globally connected partner ecosystem.
              </p>
            </motion.div>

            <div className="l-partner-grid">
              {/* Left — CTA panel */}
              <motion.div
                className="l-partner-left"
                initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  background: 'linear-gradient(145deg, #0D9488 0%, #0F766E 100%)',
                  borderRadius: '16px', padding: '40px 36px',
                  color: 'white',
                }}
              >
                <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '14px' }}>
                  Partnership Benefits
                </p>
                <h3 style={{ fontSize: '22px', fontWeight: '800', lineHeight: 1.25, marginBottom: '16px', letterSpacing: '-0.02em' }}>
                  10 Reasons to Become a Partner
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.8, opacity: 0.84, marginBottom: '28px' }}>
                  From Microsoft co-branding rights to dedicated business development
                  support, our ecosystem is built for your success.
                </p>
                <button className="l-btn-primary" onClick={() => navigate('/register')}
                  style={{ background: 'white', color: '#0D9488', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', fontSize: '14px', padding: '12px 28px' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F0FDFB' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                >
                  Apply Now <ArrowRight size={14} />
                </button>
              </motion.div>

              {/* Right — benefit cards */}
              <motion.div
                initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="l-benefit-grid">
                  {benefits.map((b, i) => (
                    <div key={i} className="l-benefit-item">
                      <CheckCircle size={15} color="#0D9488" style={{ flexShrink: 0 }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════ FOOTER ════════════════ */}
        <footer className="l-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logos/vendorjunction.png" alt="VendorJunction" style={{ height: '20px', opacity: 0.3, filter: 'grayscale(1)' }} />
            <span>© 2026 Vendor Junction Group. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((t, i) => (
              <a key={i} href="#" onClick={e => e.preventDefault()}>{t}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  )
}
