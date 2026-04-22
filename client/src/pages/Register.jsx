import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneInputLib from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, CheckCircle, User, Building2 } from 'lucide-react'
import api from '../utils/api'

const PhoneInput = PhoneInputLib.default || PhoneInputLib

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin',
  'Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia',
  'Comoros','Congo (DRC)','Congo (Republic)','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
  'Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea',
  'Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana',
  'Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland',
  'India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan',
  'Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya',
  'Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta',
  'Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro',
  'Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger',
  'Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama',
  'Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino',
  'Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain',
  'Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda',
  'Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu',
  'Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

const STEP_LABELS = ['Personal Information', 'Company Information']

function StepIndicator({ currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '36px' }}>
      {STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '15px',
                background: isDone ? 'var(--success)' : isActive ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: isDone || isActive ? 'white' : 'var(--text-muted)',
                border: isDone || isActive ? 'none' : '1px solid var(--border-default)',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 20px rgba(13,148,136,0.4)' : 'none',
              }}>
                {isDone ? <CheckCircle size={18} /> : stepNum}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: '500',
                color: isActive ? 'var(--accent-primary)' : isDone ? 'var(--success)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div style={{
                width: '80px', height: '2px',
                background: isDone ? 'var(--success)' : 'var(--border-default)',
                margin: '0 8px', marginBottom: '22px',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  // Mobile phone
  const [phoneValue, setPhoneValue] = useState('')
  const [phoneCountry, setPhoneCountry] = useState(null)
  const [phoneError, setPhoneError] = useState('')

  // Landline with country code selector
  const [landlineValue, setLandlineValue] = useState('')
  const [landlineCountry, setLandlineCountry] = useState(null)
  const [landlineError, setLandlineError] = useState('')

  // Annual turnover — formatted display
  const [turnoverDisplay, setTurnoverDisplay] = useState('')
  const [turnoverRaw, setTurnoverRaw] = useState('')

  const { register, handleSubmit, trigger, formState: { errors } } = useForm({ mode: 'onBlur' })

  const step1Fields = ['title', 'first_name', 'last_name', 'job_title', 'mobile', 'email']

  // Validate using libphonenumber-js for accurate per-country length check
  const validatePhone = (value, countryData) => {
    if (!value || value.length < 4) return false
    const dialCode = countryData?.dialCode || ''
    const isoCode = countryData?.countryCode?.toUpperCase()
    // Strip the dial code from the full value to get the national number
    const nationalNumber = value.startsWith(dialCode) ? value.slice(dialCode.length) : value
    if (!nationalNumber || nationalNumber.length < 3) return false
    try {
      const parsed = parsePhoneNumberFromString('+' + value, isoCode)
      return parsed ? parsed.isValid() : false
    } catch {
      return false
    }
  }

  // Validate landline (optional — only validate if number entered beyond dial code)
  const validateLandline = (value, countryData) => {
    if (!value || value.length <= (countryData?.dialCode?.length || 1)) return true // empty = OK (optional)
    const isoCode = countryData?.countryCode?.toUpperCase()
    try {
      const parsed = parsePhoneNumberFromString('+' + value, isoCode)
      return parsed ? parsed.isValid() : false
    } catch {
      return false
    }
  }

  const handleNext = async () => {
    const valid = await trigger(step1Fields)
    if (!validatePhone(phoneValue, phoneCountry)) {
      setPhoneError(`Please enter a valid${phoneCountry?.name ? ' ' + phoneCountry.name : ''} mobile number`)
      return
    }
    setPhoneError('')
    if (valid) setStep(2)
  }

  const handleTurnoverChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setTurnoverRaw(raw)
    setTurnoverDisplay(raw ? Number(raw).toLocaleString('en-US') : '')
  }

  const onSubmit = async (data) => {
    // Validate landline if filled
    if (landlineValue && landlineValue.length > (landlineCountry?.dialCode?.length || 1)) {
      if (!validateLandline(landlineValue, landlineCountry)) {
        setLandlineError(`Please enter a valid${landlineCountry?.name ? ' ' + landlineCountry.name : ''} landline number`)
        return
      }
    }
    setLandlineError('')
    setLoading(true)
    try {
      const payload = {
        ...data,
        mobile: '+' + phoneValue,
        landline: landlineValue ? '+' + landlineValue : '',
        annual_turnover: turnoverRaw || '',
      }
      const res = await api.post('/api/partners/register', payload)
      setSuccess(res.data)
      toast.success('Application submitted successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  /* ── Success screen ── */
  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        backgroundImage: 'radial-gradient(ellipse at 30% 40%, rgba(16,185,129,0.1) 0%, transparent 60%)',
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: '24px', padding: '56px 48px',
            maxWidth: '520px', width: '100%', textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--success-light)', border: '2px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
            }}
          >
            <CheckCircle size={40} color="var(--success)" />
          </motion.div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Application Submitted!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
            Thank you for applying to the VendorJunction Partner Program. Your application is under review.
          </p>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-accent)',
            borderRadius: '12px', padding: '20px', marginBottom: '28px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Your Registration Code
            </p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '0.1em' }}>
              {success.regCode || 'VJ-PENDING'}
            </p>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7, marginBottom: '32px' }}>
            Our team will review your application within 3–5 business days and notify you via email.
          </p>
          <button className="btn btn-primary w-full" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  /* ── Shared styles ── */
  const regHeaderStyle = `
    .rh-header {
      position: sticky; top: 0; z-index: 100;
      height: 76px;
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid #E2E8F0;
      box-shadow: 0 1px 12px rgba(0,0,0,0.06);
      display: flex; align-items: center;
      padding: 0 40px;
    }
    .rh-logos {
      position: absolute; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 28px;
    }
    .rh-divider { width: 1px; height: 36px; background: #E2E8F0; flex-shrink: 0; }
    .rh-kamk-wrap { width: 130px; height: 60px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .rh-kamk-wrap img { width: 130px; height: auto; }
    .rh-edu-wrap { width: 130px; height: 60px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .rh-edu-wrap img { width: 130px; height: auto; }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .rh-header { padding: 0 10px; height: 56px; }
      .rh-back-text { display: none; }
      .rh-step-pill { display: none; }
      .rh-logos {
        position: static;
        transform: none;
        flex: 1;
        justify-content: center;
        gap: 10px;
      }
      .rh-divider { display: none; }
      .rh-vj-img { height: 34px !important; }
      .rh-ms-img { height: 20px !important; }
      .rh-kamk-wrap { width: 68px !important; height: 30px !important; }
      .rh-kamk-wrap img { width: 68px !important; }
      .rh-edu-wrap { width: 68px !important; height: 30px !important; }
      .rh-edu-wrap img { width: 68px !important; }
    }

    @media (max-width: 380px) {
      .rh-header { padding: 0 6px; }
      .rh-kamk-wrap { width: 58px !important; height: 26px !important; }
      .rh-kamk-wrap img { width: 58px !important; }
      .rh-edu-wrap { width: 58px !important; height: 26px !important; }
      .rh-edu-wrap img { width: 58px !important; }
      .rh-ms-img { height: 17px !important; }
      .rh-vj-img { height: 28px !important; }
    }
  `

  /* ── Main form ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <style>{regHeaderStyle}</style>

      {/* Sticky header */}
      <header className="rh-header">
        {/* Back link */}
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: '#64748B', fontSize: '13px', fontWeight: '500',
          textDecoration: 'none', transition: 'color 0.15s', flexShrink: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
        >
          <ArrowLeft size={15} />
          <span className="rh-back-text">Back</span>
        </Link>

        {/* Centered logos — same 4-logo layout as landing */}
        <div className="rh-logos">
          <img className="rh-vj-img" src="/logos/vendorjunction.png" alt="VendorJunction" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          <div className="rh-divider" />
          <img className="rh-ms-img" src="/logos/microsoft.png" alt="Microsoft" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          <div className="rh-divider" />
          <div className="rh-kamk-wrap">
            <img src="/logos/kamk.png" alt="KAMK University Finland" />
          </div>
          <div className="rh-divider" />
          <div className="rh-edu-wrap">
            <img src="/logos/edukamu.png" alt="Edukamu" />
          </div>
        </div>

        {/* Step pill */}
        <div className="rh-step-pill" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)',
            borderRadius: '100px', padding: '5px 14px',
            fontSize: '12px', color: '#0D9488', fontWeight: '600',
          }}>
            Step {step} / 2
          </div>
        </div>
      </header>

      {/* Page body */}
      <div style={{
        padding: '48px 24px 80px',
        backgroundImage: 'radial-gradient(ellipse at 20% 30%, rgba(13,148,136,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(245,158,11,0.04) 0%, transparent 50%)',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '36px' }}
          >
            <div style={{
              display: 'inline-block', padding: '4px 14px', marginBottom: '14px',
              background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)',
              borderRadius: '100px', fontSize: '11px', fontWeight: '700',
              color: '#0D9488', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Partner Application
            </div>
            <h1 style={{
              fontSize: '32px', fontWeight: '800', color: '#0F172A',
              letterSpacing: '-0.03em', marginBottom: '8px',
            }}>
              Become a Partner
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.7 }}>
              Apply for the Microsoft Skills for Jobs Microdegree Partner Program
            </p>
          </motion.div>

          {/* Step indicator */}
          <StepIndicator currentStep={step} />

          {/* Form card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '20px',
            padding: '36px',
            overflow: 'hidden',
          }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait" custom={step}>

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={1}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--accent-primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <User size={16} color="var(--accent-primary)" />
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>Personal Information</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Title */}
                      <div className="form-group">
                        <label className="form-label">Title <span className="required">*</span></label>
                        <select
                          className={`form-select${errors.title ? ' error' : ''}`}
                          {...register('title', { required: 'Title is required' })}
                          defaultValue=""
                        >
                          <option value="" disabled>Select title</option>
                          {['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {errors.title && <span className="form-error">{errors.title.message}</span>}
                      </div>

                      {/* First / Last Name */}
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">First Name <span className="required">*</span></label>
                          <input
                            className={`form-input${errors.first_name ? ' error' : ''}`}
                            placeholder="John"
                            {...register('first_name', { required: 'First name is required' })}
                          />
                          {errors.first_name && <span className="form-error">{errors.first_name.message}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Last Name <span className="required">*</span></label>
                          <input
                            className={`form-input${errors.last_name ? ' error' : ''}`}
                            placeholder="Doe"
                            {...register('last_name', { required: 'Last name is required' })}
                          />
                          {errors.last_name && <span className="form-error">{errors.last_name.message}</span>}
                        </div>
                      </div>

                      {/* Job Title */}
                      <div className="form-group">
                        <label className="form-label">Job Title <span className="required">*</span></label>
                        <input
                          className={`form-input${errors.job_title ? ' error' : ''}`}
                          placeholder="e.g. CEO, Training Manager"
                          {...register('job_title', { required: 'Job title is required' })}
                        />
                        {errors.job_title && <span className="form-error">{errors.job_title.message}</span>}
                      </div>

                      {/* Mobile */}
                      <div className="form-group">
                        <label className="form-label">Mobile Number <span className="required">*</span></label>
                        <PhoneInput
                          country="ae"
                          value={phoneValue}
                          onChange={(val, country) => {
                            setPhoneValue(val)
                            setPhoneCountry(country)
                            if (phoneError) setPhoneError('')
                          }}
                          isValid={(val, country) => {
                            if (!val || val === country?.dialCode) return true
                            return validatePhone(val, country)
                          }}
                          enableSearch
                          inputProps={{ name: 'mobile' }}
                        />
                        {phoneError && <span className="form-error">{phoneError}</span>}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                          Enter full number including area code — validated per country
                        </span>
                      </div>

                      {/* Email */}
                      <div className="form-group">
                        <label className="form-label">Email Address <span className="required">*</span></label>
                        <input
                          className={`form-input${errors.email ? ' error' : ''}`}
                          type="email"
                          placeholder="john@company.com"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                          })}
                        />
                        {errors.email && <span className="form-error">{errors.email.message}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                      <button type="button" className="btn btn-primary" onClick={handleNext} style={{ minWidth: '140px' }}>
                        Next Step <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={2}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--accent-gold-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Building2 size={16} color="var(--accent-gold)" />
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>Company Information</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Company Name */}
                      <div className="form-group">
                        <label className="form-label">Company Name <span className="required">*</span></label>
                        <input
                          className={`form-input${errors.company_name ? ' error' : ''}`}
                          placeholder="Acme Corporation"
                          {...register('company_name', { required: 'Company name is required' })}
                        />
                        {errors.company_name && <span className="form-error">{errors.company_name.message}</span>}
                      </div>

                      {/* Company Type */}
                      <div className="form-group">
                        <label className="form-label">Company Type <span className="required">*</span></label>
                        <select
                          className={`form-select${errors.company_type ? ' error' : ''}`}
                          {...register('company_type', { required: 'Company type is required' })}
                          defaultValue=""
                        >
                          <option value="" disabled>Select company type</option>
                          {['Private Limited','Public Limited','Sole Proprietorship','Partnership','LLC','FZC','FZE','Other'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {errors.company_type && <span className="form-error">{errors.company_type.message}</span>}
                      </div>

                      {/* Address */}
                      <div className="form-group">
                        <label className="form-label">Head Office Address <span className="required">*</span></label>
                        <input
                          className={`form-input${errors.address_line1 ? ' error' : ''}`}
                          placeholder="123 Business Street"
                          {...register('address_line1', { required: 'Address is required' })}
                        />
                        {errors.address_line1 && <span className="form-error">{errors.address_line1.message}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Address Line 2 <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(optional)</span></label>
                        <input className="form-input" placeholder="Suite, Floor, Building" {...register('address_line2')} />
                      </div>

                      {/* City / Country */}
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">City <span className="required">*</span></label>
                          <input
                            className={`form-input${errors.city ? ' error' : ''}`}
                            placeholder="Dubai"
                            {...register('city', { required: 'City is required' })}
                          />
                          {errors.city && <span className="form-error">{errors.city.message}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Country <span className="required">*</span></label>
                          <select
                            className={`form-select${errors.country ? ' error' : ''}`}
                            defaultValue=""
                            {...register('country', { required: 'Country is required' })}
                          >
                            <option value="" disabled>Select country</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          {errors.country && <span className="form-error">{errors.country.message}</span>}
                        </div>
                      </div>

                      {/* Branches / Employees */}
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">No. of Branches</label>
                          <input
                            className="form-input" type="number" min="0" placeholder="0"
                            {...register('num_branches', { min: { value: 0, message: 'Must be 0 or more' } })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">No. of Employees <span className="required">*</span></label>
                          <input
                            className={`form-input${errors.num_employees ? ' error' : ''}`}
                            type="number" min="1" placeholder="10"
                            {...register('num_employees', {
                              required: 'Number of employees is required',
                              min: { value: 1, message: 'Must be at least 1' },
                            })}
                          />
                          {errors.num_employees && <span className="form-error">{errors.num_employees.message}</span>}
                        </div>
                      </div>

                      {/* Landline / Website */}
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Landline <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(optional)</span></label>
                          <PhoneInput
                            country="ae"
                            value={landlineValue}
                            onChange={(val, country) => {
                              setLandlineValue(val)
                              setLandlineCountry(country)
                              if (landlineError) setLandlineError('')
                            }}
                            isValid={(val, country) => {
                              if (!val || val === country?.dialCode) return true
                              return validateLandline(val, country)
                            }}
                            enableSearch
                            inputProps={{ name: 'landline' }}
                          />
                          {landlineError && <span className="form-error">{landlineError}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Website <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(optional)</span></label>
                          <input className="form-input" placeholder="https://www.company.com" {...register('website')} />
                        </div>
                      </div>

                      {/* Business Sector */}
                      <div className="form-group">
                        <label className="form-label">Business Sector <span className="required">*</span></label>
                        <select
                          className={`form-select${errors.business_sector ? ' error' : ''}`}
                          {...register('business_sector', { required: 'Business sector is required' })}
                          defaultValue=""
                        >
                          <option value="" disabled>Select sector</option>
                          {['Information Technology','Education','EdTech','Training','Marketing Services','Distribution','Consulting','Other'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.business_sector && <span className="form-error">{errors.business_sector.message}</span>}
                      </div>

                      {/* Business Activities */}
                      <div className="form-group">
                        <label className="form-label">Business Activities <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(optional)</span></label>
                        <textarea
                          className="form-textarea"
                          placeholder="Describe your main business activities..."
                          rows={3}
                          {...register('business_activities')}
                        />
                      </div>

                      {/* Reg No / Turnover */}
                      <div className="grid-2">
                        <div className="form-group">
                          <label className="form-label">Company Reg. No. <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(optional)</span></label>
                          <input className="form-input" placeholder="REG-123456" {...register('company_reg_no')} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Annual Turnover USD <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>(optional)</span></label>
                          <div style={{ position: 'relative' }}>
                            <span style={{
                              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                              color: 'var(--text-muted)', fontSize: '14px', pointerEvents: 'none',
                            }}>$</span>
                            <input
                              className="form-input"
                              style={{ paddingLeft: '28px' }}
                              placeholder="0"
                              value={turnoverDisplay}
                              onChange={handleTurnoverChange}
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '12px' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => setStep(1)} style={{ minWidth: '120px' }}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '160px' }}>
                        {loading ? (
                          <>
                            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                            Submitting...
                          </>
                        ) : (
                          <>Submit Application <ArrowRight size={16} /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
