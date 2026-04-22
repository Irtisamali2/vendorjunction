import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Globe, Shield, Award, Briefcase, GraduationCap, CheckCircle, ChevronRight } from 'lucide-react'

/* ── feature pill ── */
function FeaturePill({ icon: Icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 18px',
      background: 'rgba(13,148,136,0.07)',
      border: '1px solid rgba(13,148,136,0.18)',
      borderRadius: '100px',
      fontSize: '13px', color: '#0F766E', fontWeight: '600',
      fontFamily: "'Segoe UI', 'Source Sans 3', sans-serif",
    }}>
      <Icon size={13} color="#0D9488" />
      {text}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, 60])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.2 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  /* ─ Item #8 — 5 feature pills ─ */
  const features = [
    { icon: Shield, text: 'Microsoft Certified' },
    { icon: Award, text: 'EU ECTS Credits' },
    { icon: Globe, text: 'Accredited Program' },
    { icon: Briefcase, text: "Pathway to Int'l and Local Jobs" },
    { icon: GraduationCap, text: 'Higher Education in EU Universities' },
  ]

  /* ─ Item #12 — Programs with Unsplash images ─ */
  const programs = [
    {
      name: 'Cloud & Cybersecurity',
      desc: 'Architect the cloud. Secure the future.',
      img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80',
      badge: 'Cloud & Security', badgeColor: '#3B82F6',
    },
    {
      name: 'AI Developer',
      desc: 'Engineer intelligence into every solution.',
      img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=700&q=80',
      badge: 'Artificial Intelligence', badgeColor: '#0D9488',
    },
    {
      name: 'Data Engineer',
      desc: "Build the pipelines that power the world's data.",
      img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=700&q=80',
      badge: 'Data Infrastructure', badgeColor: '#F59E0B',
    },
    {
      name: 'Data Analyst',
      desc: 'Turn data into decisions that matter.',
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80',
      badge: 'Analytics & BI', badgeColor: '#10B981',
    },
    {
      name: 'Power Platform BI',
      desc: 'Automate workflows. Accelerate business.',
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80',
      badge: 'Business Intelligence', badgeColor: '#F59E0B',
    },
    {
      name: 'AI Agent',
      desc: 'Build and deploy autonomous AI agents that reason, plan, and act to solve complex business problems.',
      img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=700&q=80',
      badge: 'Autonomous AI', badgeColor: '#EF4444',
    },
  ]

  /* ─ Item #13 — 10 partnership benefits ─ */
  const benefits = [
    'Robust Partnership', 'Margin-Driven', 'Microsoft Partnership',
    'Global Credentials', 'Systems & Processes',
    'Joint Planning', 'Go To Market', 'Business Development',
    'Marketing Support', 'Enablement & Trainings',
  ]

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ════════════════════════════════════════
          NAV  (Items #2, #3) — Light Theme
      ════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px', height: '88px',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Left: VJ Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <img
            src="/logos/vendorjunction.png"
            alt="VendorJunction"
            style={{ height: '56px', width: 'auto' }}
          />
          <div style={{ width: '1px', height: '28px', background: '#E2E8F0' }} />
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Segoe UI', 'Source Sans 3', sans-serif" }}>
            PARTNER PORTAL
          </span>
        </div>

        {/* Centre: 3 Partner Logos — absolutely centered */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '36px',
        }}>
          {/* Microsoft — wide image, simple height works fine */}
          <img src="/logos/microsoft.png" alt="Microsoft" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ width: '1px', height: '44px', background: '#E2E8F0' }} />
          {/* KAMK — 1080×1350 portrait canvas with whitespace; use cover+clip to zoom into center */}
          <div style={{ width: '160px', height: '72px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/logos/kamk.png" alt="KAMK University Finland" style={{ width: '160px', height: 'auto', flexShrink: 0 }} />
          </div>
          <div style={{ width: '1px', height: '44px', background: '#E2E8F0' }} />
          {/* Edukamu — same portrait canvas issue */}
          <div style={{ width: '160px', height: '72px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/logos/edukamu.png" alt="Edukamu" style={{ width: '160px', height: 'auto', flexShrink: 0 }} />
          </div>
        </div>

        {/* Right: Nav Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button
            onClick={() => navigate('/admin/login')}
            style={{
              background: 'transparent', border: 'none', color: '#64748B',
              fontSize: '13px', fontWeight: '500', padding: '8px 16px',
              borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.background = '#F1F5F9' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent' }}
          >
            Admin
          </button>
          <button
            onClick={() => navigate('/partner/login')}
            style={{
              background: 'transparent', border: '1px solid #E2E8F0',
              color: '#475569', fontSize: '13px', fontWeight: '500',
              padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
              transition: 'all 0.15s', fontFamily: "'Segoe UI', 'Source Sans 3', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.color = '#0D9488' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
          >
            Partner Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #0D9488, #0D9488)',
              border: 'none', color: 'white', fontSize: '13px', fontWeight: '600',
              padding: '10px 22px', borderRadius: '8px', cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(13,148,136,0.3)', transition: 'all 0.2s',
              fontFamily: "'Segoe UI', 'Source Sans 3', sans-serif", display: 'flex', alignItems: 'center', gap: '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,148,136,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(13,148,136,0.3)' }}
          >
            Become a Partner <ArrowRight size={13} />
          </button>
        </div>
      </motion.nav>

      {/* ════════════════════════════════════════
          HERO  (Items #4–#9) — Light Theme
      ════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{
          position: 'relative', zIndex: 1, paddingTop: '160px', paddingBottom: '80px', y: heroY,
          background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 100%)',
        }}
      >
        {/* Subtle decorative blobs */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '500px', height: '500px', top: '-100px', left: '-150px', borderRadius: '50%', background: 'rgba(13,148,136,0.06)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', width: '400px', height: '400px', top: '10%', right: '-100px', borderRadius: '50%', background: 'rgba(245,158,11,0.05)', filter: 'blur(80px)' }} />
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Item #4 — Badge with globe icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '28px',
              padding: '8px 20px 8px 14px',
              background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.2)',
              borderRadius: '100px', cursor: 'pointer',
            }}
            onClick={() => navigate('/register')}
          >
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D9488, #0D9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Globe size={13} color="white" />
            </div>
            <span style={{ fontSize: '13px', color: '#0F766E', fontWeight: '500' }}>
              Global Partner Program Now Open – Apply Today
            </span>
            <ChevronRight size={14} color="#0D9488" />
          </motion.div>

          {/* Item #5 — "Microdegree Program" brand label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
            style={{ marginBottom: '10px' }}
          >
            <span style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '0.03em', color: '#0EA5E9', fontFamily: 'Inter, sans-serif' }}>
              Microdegree Program
            </span>
          </motion.div>

          {/* H1 — Item #5 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: '900', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '20px' }}
          >
            <span style={{ color: '#0F172A' }}>Microsoft Skills</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #0D9488 0%, #A78BFA 50%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>for Jobs</span>
          </motion.h1>

          {/* Item #6 — Global Partner Portal */}
          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: '600', color: '#1E293B', marginBottom: '16px', letterSpacing: '-0.01em' }}
          >
            Global Partner Portal
          </motion.p>

          {/* Item #7 — New description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.9, maxWidth: '640px', margin: '0 auto 40px' }}
          >
            Join the global network of accredited partners delivering Microsoft-certified professional
            Microdegree certifications with EU ECTS credits in{' '}
            <span style={{ color: '#475569', fontWeight: '500' }}>AI, Cloud and Cybersecurity, Data Engineering,
              Data Analytics, Power Platform BI and AI Agent.</span>
          </motion.p>

          {/* Item #8 — 5 Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}
          >
            {features.map((f, i) => <FeaturePill key={i} icon={f.icon} text={f.text} />)}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '72px' }}
          >
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #0D9488, #0D9488)',
                border: 'none', color: 'white', fontSize: '15px', fontWeight: '600',
                padding: '16px 38px', borderRadius: '12px', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(13,148,136,0.35)', transition: 'all 0.25s',
                fontFamily: "'Segoe UI', 'Source Sans 3', sans-serif", display: 'flex', alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(13,148,136,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,148,136,0.35)' }}
            >
              Become a Partner <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/partner/login')}
              style={{
                background: '#FFFFFF', border: '1.5px solid #E2E8F0',
                color: '#1E293B', fontSize: '15px', fontWeight: '600',
                padding: '16px 38px', borderRadius: '12px', cursor: 'pointer',
                transition: 'all 0.25s', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.color = '#0D9488' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#1E293B' }}
            >
              Partner Login
            </button>
          </motion.div>

          {/* Item #9 — Logos in ORIGINAL COLOR (no filter on white bg), VJ removed */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
            <p style={{
              fontSize: '10px', color: '#CBD5E1', fontWeight: '700',
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '28px',
            }}>
              In Collaboration With
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '72px', flexWrap: 'wrap', paddingBottom: '72px',
            }}>
              {/* Microsoft logo */}
              <motion.img initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}
                src="/logos/microsoft.png" alt="Microsoft"
                style={{ height: '56px', width: 'auto', objectFit: 'contain', opacity: 1, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              />
              {/* KAMK — taller to match visible size of microsoft */}
              <motion.img initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.4 }}
                src="/logos/kamk.png" alt="KAMK University Finland"
                style={{ height: '160px', width: 'auto', objectFit: 'contain', maxWidth: '280px', opacity: 0.9, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
              />
              {/* Edukamu — same treatment */}
              <motion.img initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.4 }}
                src="/logos/edukamu.png" alt="Edukamu"
                style={{ height: '140px', width: 'auto', objectFit: 'contain', maxWidth: '280px', opacity: 0.9, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════
          STATS BAR  (Item #10)
      ════════════════════════════════════════ */}
      <section ref={statsRef} style={{ position: 'relative', zIndex: 1, padding: '0 24px 96px', background: '#FFFFFF' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: '900px', margin: '0 auto',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            display: 'flex', flexWrap: 'wrap', overflow: 'hidden',
            boxShadow: '0 4px 32px rgba(13,148,136,0.08)',
          }}
        >
          {[
            { value: 46, suffix: '+', label: 'Partner Organisations', color: '#0D9488' },
            { value: 39, suffix: '', label: 'Countries Reached', color: '#F59E0B' },
            { value: 6, suffix: '', label: 'Microdegree Programs', color: '#10B981' },
            { value: 70000, suffix: '+', label: 'Learners', color: '#0D9488' },
          ].map((s, i, arr) => (
            <div key={i} style={{
              flex: 1, minWidth: '160px', padding: '36px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              borderRight: i < arr.length - 1 ? '1px solid #E2E8F0' : 'none',
            }}>
              <span style={{
                fontSize: '42px', fontWeight: '800', lineHeight: 1,
                background: `linear-gradient(135deg, ${s.color}, ${s.color}99)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {statsVisible ? <StatNumber value={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
              </span>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', textAlign: 'center' }}>
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          PROGRAMS GRID  (Items #11, #12) — redesigned cards with images
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 100px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '56px', paddingTop: '80px' }}
          >
            <div style={{
              display: 'inline-block', padding: '5px 16px',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '100px', fontSize: '11px', fontWeight: '700',
              color: '#D97706', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px',
            }}>
              Program Portfolio
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: '800',
              color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '14px',
            }}>
              Microdegree Program Specialisations
            </h2>
            <p style={{ color: '#64748B', fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
              Industry-aligned programs built around the most in-demand technologies
            </p>
          </motion.div>

          {/* Program cards — 3x2 grid with Unsplash images */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {programs.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8ECF0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s',
                  cursor: 'default',
                }}
                whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(13,148,136,0.12)', borderColor: 'rgba(13,148,136,0.2)' }}
              >
                {/* Card Image */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img
                    src={p.img}
                    alt={p.name}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  {/* Overlay gradient at bottom of image */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.25))',
                  }} />
                  {/* Badge on image */}
                  <span style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: p.badgeColor, color: 'white',
                    fontSize: '10px', fontWeight: '700', padding: '3px 10px',
                    borderRadius: '100px', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {p.badge}
                  </span>
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px 22px 24px' }}>
                  <h3 style={{ fontWeight: '700', color: '#0F172A', fontSize: '16px', marginBottom: '8px' }}>
                    {p.name}
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '13.5px', lineHeight: 1.65 }}>
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PARTNERSHIP BENEFITS + CTA  (Items #13, #14)
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 100px', background: '#FFFFFF' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: '980px', margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(13,148,136,0.05) 0%, rgba(139,92,246,0.04) 50%, rgba(245,158,11,0.04) 100%)',
            border: '1.5px solid rgba(13,148,136,0.12)',
            borderRadius: '24px', padding: '60px 48px',
            textAlign: 'center',
            boxShadow: '0 4px 40px rgba(13,148,136,0.06)',
          }}
        >
          {/* Item #13 — 10 benefits in 2 rows */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', color: '#0D9488', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Partnership Benefits
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {benefits.slice(0, 5).map((t, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '100px', padding: '7px 16px',
                  fontSize: '12.5px', color: '#059669', fontWeight: '500',
                }}>
                  <CheckCircle size={12} /> {t}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {benefits.slice(5).map((t, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.18)',
                  borderRadius: '100px', padding: '7px 16px',
                  fontSize: '12.5px', color: '#0F766E', fontWeight: '500',
                }}>
                  <CheckCircle size={12} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Item #14 — Updated CTA headline */}
          <h2 style={{
            fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: '800', color: '#0F172A',
            letterSpacing: '-0.03em', marginBottom: '8px', lineHeight: 1.15,
          }}>
            Ready to Join the Microsoft Skills for Jobs
          </h2>
          <h2 style={{
            fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: '800',
            letterSpacing: '-0.03em', marginBottom: '28px', lineHeight: 1.15,
            background: 'linear-gradient(135deg, #0D9488, #0D9488)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Microdegree Program Global Partners Ecosystem?
          </h2>

          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #0D9488, #0D9488)',
              border: 'none', color: 'white', fontSize: '15px', fontWeight: '600',
              padding: '16px 52px', borderRadius: '12px', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(13,148,136,0.35)', transition: 'all 0.25s',
              fontFamily: 'Inter, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(13,148,136,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,148,136,0.35)' }}
          >
            Apply Now <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid #E2E8F0',
        padding: '32px 48px',
        background: '#F8FAFC',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logos/vendorjunction.png" alt="VendorJunction" style={{ height: '24px', opacity: 0.4 }} />
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>© 2026 Vendor Junction Group. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((t, i) => (
            <span key={i} style={{ color: '#94A3B8', fontSize: '13px', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
            >{t}</span>
          ))}
        </div>
      </footer>

    </div>
  )
}

/* ── inline stat number with countup ── */
function StatNumber({ value, suffix }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = null
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 2000, 1)
      setCount(Math.floor(p * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{count.toLocaleString()}{suffix}</>
}
