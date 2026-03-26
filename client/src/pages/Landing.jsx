import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Shield, Globe, Award, Users, BookOpen, CheckCircle, ChevronRight } from 'lucide-react'

/* ── animated count-up ── */
function useCountUp(target, duration = 2000, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, active])
  return val
}

/* ── floating orb ── */
function Orb({ style }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', ...style }} />
}

/* ── stat card ── */
function StatCard({ value, suffix, label, color, active }) {
  const count = useCountUp(value, 2000, active)
  return (
    <div style={{
      flex: 1, minWidth: '140px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '6px', padding: '28px 20px',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{
        fontSize: '42px', fontWeight: '800', lineHeight: 1,
        background: `linear-gradient(135deg, ${color}, white)`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {count}{suffix}
      </span>
      <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

/* ── feature pill ── */
function FeaturePill({ icon: Icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 16px',
      background: 'rgba(99,102,241,0.08)',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '100px',
      fontSize: '13px', color: '#A5B4FC', fontWeight: '500',
    }}>
      <Icon size={13} />
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
  const heroY = useTransform(scrollY, [0, 400], [0, 80])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.2 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const logos = [
    { src: '/logos/kamk.png', alt: 'KAMK University Finland' },
    { src: '/logos/microsoft.png', alt: 'Microsoft' },
    { src: '/logos/edukamu.png', alt: 'Edukamu' },
    { src: '/logos/vendorjunction.png', alt: 'VendorJunction' },
  ]

  const features = [
    { icon: Shield, text: 'Microsoft Certified' },
    { icon: Globe, text: 'Global Network' },
    { icon: Award, text: 'Accredited Program' },
    { icon: BookOpen, text: 'Microdegree Certified' },
  ]

  const programs = [
    { name: 'AI Developer', icon: '🤖', desc: 'Build intelligent systems with Azure AI' },
    { name: 'Data Analyst', icon: '📊', desc: 'Transform data into business insights' },
    { name: 'Cybersecurity', icon: '🔐', desc: 'Protect digital infrastructure' },
    { name: 'Cloud Engineering', icon: '☁️', desc: 'Architect scalable cloud solutions' },
    { name: 'Power Platform', icon: '⚡', desc: 'Automate business workflows' },
    { name: 'Data Engineering', icon: '🔧', desc: 'Design robust data pipelines' },
  ]

  return (
    <div style={{ background: '#0A0E1A', minHeight: '100vh', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── Background Orbs ── */}
      <Orb style={{ width: '600px', height: '600px', top: '-200px', left: '-200px', background: 'rgba(99,102,241,0.15)' }} />
      <Orb style={{ width: '500px', height: '500px', top: '20%', right: '-150px', background: 'rgba(245,158,11,0.08)' }} />
      <Orb style={{ width: '400px', height: '400px', bottom: '10%', left: '20%', background: 'rgba(139,92,246,0.1)' }} />

      {/* ── Grid overlay ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
        backgroundSize: '72px 72px',
      }} />

      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 48px', height: '68px',
          backdropFilter: 'blur(20px)',
          background: 'rgba(10,14,26,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logos/vendorjunction.png" alt="VendorJunction" style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', letterSpacing: '0.05em' }}>PARTNER PORTAL</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin/login')}
            style={{
              background: 'transparent', border: 'none', color: '#64748B',
              fontSize: '13px', fontWeight: '500', padding: '8px 16px',
              borderRadius: '8px', cursor: 'pointer', transition: 'color 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
          >
            Admin
          </button>
          <button
            onClick={() => navigate('/partner/login')}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8', fontSize: '13px', fontWeight: '500',
              padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
              transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = '#F8FAFC' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94A3B8' }}
          >
            Partner Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              border: 'none', color: 'white', fontSize: '13px', fontWeight: '600',
              padding: '9px 22px', borderRadius: '8px', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(99,102,241,0.3)', transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)' }}
          >
            Become a Partner <ArrowRight size={13} />
          </button>
        </div>
      </motion.nav>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ position: 'relative', zIndex: 1, paddingTop: '140px', paddingBottom: '80px', y: heroY }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px',
              padding: '6px 16px 6px 10px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '100px',
            }}
          >
            <span style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white',
              fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px',
              letterSpacing: '0.08em',
            }}>NEW</span>
            <span style={{ fontSize: '13px', color: '#A5B4FC', fontWeight: '500' }}>
              2026 Partner Program Now Open — Apply Today
            </span>
            <ChevronRight size={13} color="#6366F1" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: '900', lineHeight: 1.05,
              letterSpacing: '-0.04em', marginBottom: '24px',
            }}
          >
            <span style={{ color: '#F8FAFC' }}>Microsoft Skills</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #A78BFA 50%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>for Jobs</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: '500',
              color: '#94A3B8', marginBottom: '16px', letterSpacing: '-0.01em',
            }}
          >
            Microdegree Program <span style={{ color: '#F8FAFC' }}>Partner Portal</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            style={{
              fontSize: '16px', color: '#64748B', lineHeight: 1.8,
              maxWidth: '560px', margin: '0 auto 40px',
            }}
          >
            Join the global network of accredited training partners delivering Microsoft-certified
            microdegrees in AI, Cloud, Data, and Cybersecurity.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}
          >
            {features.map((f, i) => <FeaturePill key={i} icon={f.icon} text={f.text} />)}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}
          >
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none', color: 'white', fontSize: '15px', fontWeight: '600',
                padding: '16px 36px', borderRadius: '12px', cursor: 'pointer',
                boxShadow: '0 0 40px rgba(99,102,241,0.35)', transition: 'all 0.25s',
                fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '8px',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.35)' }}
            >
              Become a Partner <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/partner/login')}
              style={{
                background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#F8FAFC', fontSize: '15px', fontWeight: '600',
                padding: '16px 36px', borderRadius: '12px', cursor: 'pointer',
                backdropFilter: 'blur(10px)', transition: 'all 0.25s',
                fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,250,252,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,250,252,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              Partner Login
            </button>
          </motion.div>

          {/* ── Partner Logos ── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p style={{ fontSize: '11px', color: '#374151', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
              In Collaboration With
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '40px', flexWrap: 'wrap',
            }}>
              {logos.map((logo, i) => (
                <motion.img
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                  src={logo.src}
                  alt={logo.alt}
                  style={{
                    height: '36px', width: 'auto', objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                    opacity: 0.55,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.55'}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════ */}
      <section ref={statsRef} style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: '800px', margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(17,24,39,0.6))',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px', backdropFilter: 'blur(20px)',
            display: 'flex', flexWrap: 'wrap', overflow: 'hidden',
            boxShadow: '0 8px 48px rgba(0,0,0,0.4)',
          }}
        >
          {[
            { value: 40, suffix: '+', label: 'Partner Organizations', color: '#6366F1' },
            { value: 12, suffix: '', label: 'Countries Reached', color: '#F59E0B' },
            { value: 6, suffix: '', label: 'Microdegree Programs', color: '#10B981' },
            { value: 5000, suffix: '+', label: 'Learners Enrolled', color: '#A78BFA' },
          ].map((s, i, arr) => (
            <div key={i} style={{
              flex: 1, minWidth: '140px', padding: '32px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <span style={{
                fontSize: '40px', fontWeight: '800', lineHeight: 1,
                background: `linear-gradient(135deg, ${s.color}, white)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {statsVisible ? <StatNumber value={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500', textAlign: 'center', letterSpacing: '0.02em' }}>{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          PROGRAMS GRID
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 100px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            <div style={{
              display: 'inline-block', padding: '4px 14px',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '100px', fontSize: '11px', fontWeight: '700',
              color: '#F59E0B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px',
            }}>
              Program Portfolio
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800',
              color: '#F8FAFC', letterSpacing: '-0.03em', marginBottom: '12px',
            }}>
              Microdegree Specializations
            </h2>
            <p style={{ color: '#64748B', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
              Industry-aligned programs built around Microsoft technologies
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {programs.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                style={{
                  background: 'rgba(30,41,59,0.5)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', padding: '28px 24px',
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.25s', cursor: 'default',
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                }}
                whileHover={{ y: -4, borderColor: 'rgba(99,102,241,0.3)', boxShadow: '0 8px 32px rgba(99,102,241,0.1)' }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                }}>
                  {p.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: '#F8FAFC', fontSize: '15px', marginBottom: '6px' }}>{p.name}</div>
                  <div style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: '900px', margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(245,158,11,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '24px', padding: '64px 48px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            boxShadow: '0 0 80px rgba(99,102,241,0.08)',
          }}
        >
          <Orb style={{ width: '300px', height: '300px', top: '-100px', right: '-80px', background: 'rgba(99,102,241,0.15)' }} />
          <Orb style={{ width: '200px', height: '200px', bottom: '-60px', left: '-40px', background: 'rgba(245,158,11,0.1)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['Flexible Partnership', 'Revenue Share', 'Marketing Support', 'Tech Enablement'].map((t, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '100px', padding: '4px 12px',
                  fontSize: '12px', color: '#34D399', fontWeight: '500',
                }}>
                  <CheckCircle size={11} /> {t}
                </span>
              ))}
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#F8FAFC',
              letterSpacing: '-0.03em', marginBottom: '16px',
            }}>
              Ready to Join the Ecosystem?
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '16px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.7 }}>
              Applications for the 2026 Microsoft Microdegree Partner Program are open. Limited partner slots available.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  border: 'none', color: 'white', fontSize: '15px', fontWeight: '600',
                  padding: '16px 40px', borderRadius: '12px', cursor: 'pointer',
                  boxShadow: '0 0 32px rgba(99,102,241,0.4)', transition: 'all 0.25s',
                  fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.4)' }}
              >
                Apply Now — It's Free <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '32px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logos/vendorjunction.png" alt="VendorJunction" style={{ height: '22px', filter: 'brightness(0) invert(1)', opacity: 0.4 }} />
          <span style={{ color: '#374151', fontSize: '13px' }}>© 2026 Vendor Junction Group. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((t, i) => (
            <span key={i} style={{ color: '#374151', fontSize: '13px', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
              onMouseLeave={e => e.currentTarget.style.color = '#374151'}
            >{t}</span>
          ))}
        </div>
      </footer>

    </div>
  )
}

/* inline stat number with countup */
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
  return <>{count}{suffix}</>
}
