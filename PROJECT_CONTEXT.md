# VendorJunction — Project Context

> **Last Updated:** 2026-04-22
> Always update this file after each major work session.

---

## Overview

**VendorJunction** is a Microsoft Microdegree Program (MDP) Partner Portal — a MERN stack web application that allows training organizations to register as partners and be managed by an admin.

- **Stack:** MongoDB-less (uses **MySQL**), Express.js backend + React (Vite) frontend
- **DB Schema:** `vendorjunction_schema.sql` at root
- **Repo Root:** `D:\vendorjunction`

---

## Project Structure

```
D:\vendorjunction
├── client/                    # React (Vite) frontend
│   ├── public/
│   │   ├── logos/             # Logos for landing page
│   │   │   ├── edukamu.png
│   │   │   ├── kamk.png
│   │   │   ├── microsoft.png
│   │   │   └── vendorjunction.png
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.jsx            # Routes: /, /register, /admin/*, /partner/*
│       ├── main.jsx
│       ├── index.css          # Global CSS variables + utility classes (835 lines)
│       ├── assets/
│       ├── components/
│       │   └── ProtectedRoute.jsx
│       ├── contexts/
│       │   └── AuthContext.jsx
│       ├── layouts/
│       │   ├── AdminLayout.jsx   # Sidebar + topbar for admin portal
│       │   └── PartnerLayout.jsx
│       ├── pages/
│       │   ├── Landing.jsx       # Main landing page (544 lines)
│       │   ├── Register.jsx      # Partner registration multi-step form
│       │   ├── AdminLogin.jsx    # Admin login page
│       │   ├── PartnerLogin.jsx  # Partner login page
│       │   ├── admin/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Partners.jsx
│       │   │   ├── PartnerDetail.jsx
│       │   │   ├── EmailConfig.jsx
│       │   │   ├── EmailTemplates.jsx
│       │   │   └── EmailLogs.jsx
│       │   └── partner/
│       │       └── PartnerDashboard.jsx
│       └── utils/
│           └── api.js
├── server/                    # Express.js backend
│   ├── index.js               # Entry point
│   ├── .env                   # DB creds, JWT secret, SMTP
│   ├── config/                # DB connection
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── partners.js        # CRUD + stats for partners
│   │   ├── email.js           # Email config/templates/logs
│   │   ├── programs.js
│   │   └── attachments.js
│   └── services/
│       └── emailService.js
├── assets/
│   ├── all assets/            # Source logos and brand assets
│   │   ├── KAMK logo.png
│   │   ├── Edukamu logo.png
│   │   ├── Microsoft Logo (1).png
│   │   ├── Microsoft-grey logo (1).png
│   │   ├── VJ - JPEG - Logo.jpg
│   │   ├── VJ - AI - Logo.ai
│   │   └── VJ - PDF - Logo.pdf
│   └── img/
└── vendorjunction_schema.sql
```

---

## Pages & Routes

| Route | Component | Status |
|-------|-----------|--------|
| `/` | `Landing.jsx` | ✅ Complete |
| `/register` | `Register.jsx` | ✅ Complete |
| `/admin/login` | `AdminLogin.jsx` | ✅ Complete |
| `/partner/login` | `PartnerLogin.jsx` | ✅ Complete |
| `/admin/*` | `AdminLayout` + sub-pages | ✅ Complete |
| `/partner/*` | `PartnerLayout` + `PartnerDashboard` | ⚠️ Stub only |
| Client Portal | — | ❌ Not started |

---

## Design System (index.css CSS Variables)

### Current (Dark Theme → being changed to White/Light)

| Variable | Dark Value | Light Value |
|----------|-----------|-------------|
| `--bg-primary` | `#0A0E1A` | `#FFFFFF` |
| `--bg-surface` | `#111827` | `#F8FAFC` |
| `--bg-surface-2` | `#1A2235` | `#F1F5F9` |
| `--bg-card` | `#1E293B` | `#FFFFFF` |
| `--border-default` | `#2D3748` | `#E2E8F0` |
| `--text-primary` | `#F8FAFC` | `#0F172A` |
| `--text-secondary` | `#94A3B8` | `#475569` |
| `--text-muted` | `#64748B` | `#94A3B8` |
| `--accent-primary` | `#6366F1` | `#6366F1` (unchanged) |
| `--accent-gold` | `#F59E0B` | `#F59E0B` (unchanged) |
| `--success` | `#10B981` | `#10B981` (unchanged) |

---

## Landing Page Sections (top → bottom)

1. **Nav** — Logo + "PARTNER PORTAL" label, Admin / Partner Login / Become a Partner buttons
2. **Hero** — Badge, H1 "Microsoft Skills for Jobs", subheading, description, feature pills, CTA buttons
3. **Logos** — "IN COLLABORATION WITH" + KAMK, Microsoft, Edukamu, VendorJunction logos
4. **Stats Bar** — 40+ Partners, 12 Countries, 6 Programs, 5000+ Learners
5. **Programs Grid** — 6 cards: AI Developer, Data Analyst, Cybersecurity, Cloud Engineering, Power Platform, Data Engineering
6. **CTA Banner** — "Ready to Join the Ecosystem?" with Apply Now button
7. **Footer** — Logo + copyright + links

---

## Key Libraries

- **Frontend:** React 18, Vite, React Router v6, Framer Motion, Lucide React, React Hot Toast, Recharts, react-tel-input
- **Backend:** Express.js, MySQL2, JWT, Nodemailer, Multer
- **Styling:** Vanilla CSS (no Tailwind)

---

## Email System

- SMTP config stored in MySQL (configurable from admin panel)
- Email templates editable from admin panel
- Automated emails on partner registration/approval/rejection

---

## Known Gaps / TODO

- Client portal not started (partner can log in but has stub dashboard)
- White/light theme needs to be applied across all pages
- Logo assets need to be refreshed from `assets/all assets/` folder

---

## Change Log

| Date | Change |
|------|--------|
| 2026-04-22 | Initial context file created; planning white theme + landing page changes per MDP email PDF |
