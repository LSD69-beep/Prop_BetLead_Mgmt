# GlassWindow — Multi-Tenant Real Estate Due Diligence & Broker Advisory Platform

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)
[![React 19](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

A data-backed architectural advisory and lead conversion platform connecting verified property buyers with licensed real estate advisors across India's high-growth metropolitan hubs (Bengaluru, Hyderabad, and Delhi NCR).

Built with full architectural fidelity according to Google Stitch backend workflows, GlassWindow replaces speculative broker listings with an **80-point independent physical & regulatory due diligence audit**, **3D cutaway CAD floorplans**, **live listed developer stock health terminals**, and a **multi-tenant CRM pipeline**.

---

## 🏛️ Core Workflows

### 1. Customer Homebuyer Journey
```
Login Selection ➔ Customer Portal Login ➔ Regional City & Directional Zone Selection
       ➔ Home Preferences (Purpose · Bedrooms · Budget) ➔ Matching Flats Directory
       ➔ Flat Specifications & 80-Point Diligence ➔ Listed Developer Stock Quotes
```
- **City & Zone Filtering**: Interactive SVG spatial map for Bangalore, Hyderabad, and Delhi NCR with directional micro-market zones (North, South, East, West).
- **80-Point Engineering Audit**: 6-dimension resilience polygon chart measuring *Structural Integrity*, *Legal Title Clearance*, *Water Security*, *Acoustic Insulation*, *Carpet Area Usability*, and *Resale Liquidity*.
- **3D Cutaway Architectural Floorplan**: Bird's-eye spatial CAD renderings with room-by-room area allocations (Great Room, Master Suite, Verandah Deck) and laser-calibrated carpet ratios (+12% above industry median).
- **Micro-Market Benchmark**: Price-per-sq.ft comparisons versus micro-market medians and 5-year capital appreciation projections.
- **Site Walkthrough Scheduler**: Instant booking modal with dedicated RERA advisors.

### 2. Agent & Broker Advisor Journey
```
Agent Portal Login ➔ Listed Flats & Registered Developers ➔ Developer Building Locations (GIS)
       ➔ Location-Specific Buyer Leads ➔ Complete Buyer Profile Dossier
       ➔ Lead Management Dashboard (9-Stage Conversion Kanban & Velocity Tracker)
```
- **RERA Partner Directory**: Directory of listed property developers (*Sobha, DLF, Prestige, Brigade, Godrej*).
- **Building Project Locations**: Spatial GIS mini-maps with live markers categorized by construction stage (*Already Present*, *Under Construction*, *About to Start*).
- **Buyer Dossier**: High-intent buyer requirements, pre-approved loan status, interactive win probability slider, and activity notes history.
- **Lead Conversion Dashboard**:
  - Executive KPI strip (Total Leads, Weighted Pipeline in ₹ Cr, Ready-to-Close Deals).
  - **6-Stage Conversion Funnel**: Live progression analytics with bottleneck diagnosis.
  - **Lead Temperature Distribution**: 🔥 Hot (≥75%), ⚡ Warm (50–74%), and ❄ Cold (<50%) deals with click-to-filter capability.
  - **30/60/90-Day Cash Inflow Revenue Projections**.
  - Dual Kanban Pipeline & tabular CRM records.

---

## 🔍 Universal Omni-Search (`⌘K` / `Ctrl+K`)
Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux) anywhere to launch the unified multi-tenant search index:
- Search across **Flats & Luxury Villas**, **Developer Stocks**, **GIS Project Locations**, and **Buyer Leads**.
- Instant keyboard navigation (↑ / ↓ arrows, Enter to jump directly).
- Right-hand inspection drawer with detailed specifications and one-click action buttons.

---

## 💻 Tech Stack

- **Framework**: React 19 SPA
- **Build Tool**: Vite 6 (ESM)
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS v4 (`@theme` design tokens)
- **Iconography**: Lucide React & Google Material Symbols
- **Typography**: Playfair Display (Serif), Montserrat (Sans), Red Hat Mono (Tabular numerals)
- **Charts & Maps**: Pure SVG high-performance vector rendering (Zero external chart bloat)

---

## 🚀 Getting Started

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/glasswindow.git
   cd glasswindow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## ☁️ Deploying to Vercel

### Method 1: Push to GitHub & Import in Vercel (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete GlassWindow real estate advisory platform"
   git branch -M main
   git remote add origin https://github.com/your-username/glasswindow.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Log in to your [Vercel Dashboard](https://vercel.com/new).
   - Click **"Add New..." ➔ "Project"**.
   - Select your GitHub repository `glasswindow`.
   - Vercel automatically detects the **Vite** framework from `vercel.json`:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Click **Deploy**. Your app will be live with full SPA rewrite routing in seconds!

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Log in and deploy
vercel
```

---

## 📁 Project Structure

```
├── public/                     # Static assets served at root
│   └── src/assets/images/      # Architectural photography & CAD floorplans
├── src/
│   ├── assets/images/          # High-resolution property assets
│   ├── components/             # Reusable UI components
│   │   ├── Header.tsx          # 3-Zone top bar, hub selector & search trigger
│   │   ├── Footer.tsx          # RERA accreditation, disclaimers & tenant info
│   │   └── OmniSearchModal.tsx # Global ⌘K multi-tenant search index
│   ├── context/
│   │   └── AppContext.tsx      # Multi-tenant state, role switching & lead CRM
│   ├── data/
│   │   └── mockData.ts         # High-fidelity property inventory & market series
│   ├── views/                  # Primary workflow views
│   │   ├── PortalChooser.tsx   # Dual customer/agent entry portal
│   │   ├── CustomerLogin.tsx   # Homebuyer onboarding
│   │   ├── CitySelection.tsx   # Interactive SVG regional map & zone cards
│   │   ├── HomePreferences.tsx # Purpose, BHK, and budget criteria
│   │   ├── MatchingFlats.tsx   # Property list & carpet efficiency visualizer
│   │   ├── FlatDetail.tsx      # 80-point radar chart, 3D cutaways & benchmarks
│   │   ├── DeveloperStocks.tsx # Listed stock chart & multi-developer comparisons
│   │   ├── AgentLogin.tsx      # Licensed advisor authentication
│   │   ├── AgentFlats.tsx      # Developer inventory directory
│   │   ├── CompanyProjects.tsx # Stage-based GIS project locations
│   │   ├── LocationLeads.tsx   # Location-specific buyer inquiries
│   │   ├── BuyerProfile.tsx    # Dossier, loan status & win probability
│   │   └── LeadManagementDashboard.tsx # Funnel analytics & 9-stage Kanban
│   ├── types.ts                # TypeScript domain models
│   ├── index.css               # Tailwind v4 configuration & theme tokens
│   ├── main.tsx                # Client application root
│   └── App.tsx                 # Root layout & view controller
├── .gitignore                  # Git ignore rules including .vercel
├── metadata.json               # Platform metadata & permissions
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel SPA routing & asset caching rules
└── vite.config.ts              # Vite configuration & asset pipeline
```

---

## 📜 License & Compliance

All listings on GlassWindow comply with the Real Estate (Regulation and Development) Act, 2016 (RERA). Registered Regional Hub IDs:
- Bengaluru Hub (`KA-01-RERA-2048`)
- Hyderabad Hub (`TG-09-RERA-4096`)
- Delhi NCR Hub (`DL-01-RERA-8192`)
