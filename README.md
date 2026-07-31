# KINDRA

A professional AI-powered civic engagement platform where citizens, municipal officers, non-profit organizations, and corporate partners collaborate to build cleaner, safer, and more resilient communities.

KINDRA transforms civic responsibility into an engaging, rewarding experience by empowering citizens to:

- **Complete Verified Good Deeds**: Participate in volunteer missions, community cleanups, tree planting, and local welfare drives.
- **Report Civic Issues**: Easily capture and submit municipal infrastructure problems such as potholes, garbage accumulation, broken streetlights, and public safety hazards.
- **Earn Karma**: Receive instant, verified Karma points for every valid contribution through an atomic Postgres transaction engine.
- **Participate in Community Challenges**: Join high-impact campaigns organized by local government bodies, NGOs, and corporate partners.
- **View Leaderboards**: Compete on real-time global citizen leaderboards and track community impact rankings.
- **Build Community Impact**: Unlock digital civic credentials, level up through 10 achievement tiers, and redeem Karma for eco-friendly rewards and public transit vouchers.

---

# Features

### Implemented & Live Features

- **Authentication & OAuth**
  - Email and Password registration and login powered by Supabase Auth.
  - Single-click Google OAuth 2.0 social login integration.
  - Role-based session persistence and route protection middleware.

- **User Profiles & Role-Based Access Control**
  - 4 specialized role portals: Citizen (`/citizen`), Municipal Officer (`/officer`), NGO/Corporate Partner (`/partner`), and System Admin (`/admin`).
  - Dynamic user profile management with lifetime Karma stats, active rank titles, and progress tracking.

- **Mission Discovery & Details**
  - Explore categorized community volunteering missions and civic actions.
  - View detailed mission descriptions, target location coordinates, required evidence criteria, and Karma reward breakdown.

- **AI Image Verification Engine**
  - Powered by Google Gemma 4 26B Vision model via OpenRouter API.
  - Automated multi-stage photo evidence analysis for classification, primary object detection, environment validation, and confidence scoring.

- **Duplicate Image Detection**
  - Perceptual 64-bit dHash image fingerprinting to detect and reject recycled or duplicate submission photos.
  - Hamming distance calculation against historic evidence stored in Supabase.

- **GPS & Geolocation Verification**
  - Capture real-time user GPS coordinates via HTML5 Geolocation API.
  - Haversine distance formula and compass bearing calculation for location proximity verification.
  - Interactive OpenStreetMap integration using Leaflet.

- **Karma & Gamification Engine**
  - Atomic database transaction RPC (`award_karma_points`) ensuring thread-safe, double-grant proof point allocation.
  - 10-tier leveling progression system (Civic Beginner to KINDRA Ambassador) with XP requirements.
  - Animated level-up modals and level progress components.

- **Leaderboards**
  - Real-time community citizen rankings based on lifetime Karma earned.
  - Cached view performance optimizations.

- **Community Campaigns & Feed**
  - Join partner-sponsored community drives and municipal challenges.
  - Track participant progress and campaign completion milestones.

- **Civic Issue Reporting**
  - Report infrastructure defects with category selection, geotagged photos, and detailed descriptions.
  - Automatic AI classification and routing to municipal officer queues.

- **Rewards Store**
  - Spend Karma points on partner-sponsored eco-friendly discount vouchers, transit passes, and civic rewards.
  - Real-time balance validation and redemption tracking.

- **Ask Gemma AI Assistant**
  - Conversational civic assistant guiding citizens on how to report issues, find volunteer opportunities, and navigate platform features.

- **Responsive Modern UI**
  - Material Design 3 inspired layout with dark/light glassmorphism.
  - Framer Motion micro-animations, text loops, glow effects, and interactive sliders.
  - Material 3 collapsible navigation drawer for desktop and top app bar for mobile.

---

# Tech Stack

- **Frontend**: React 19, Next.js 15 (App Router), TypeScript 5.7, Tailwind CSS, Material UI (`@mui/material`, `@mui/icons-material`), Emotion (`@emotion/react`), Framer Motion, Leaflet & React-Leaflet
- **Backend**: Next.js API Routes (Serverless Route Handlers), Supabase Database PL/pgSQL RPC Functions
- **Database**: Supabase PostgreSQL (with Row Level Security policies, indexes, and custom views)
- **Authentication**: Supabase Auth (Email & Password, Google OAuth 2.0)
- **Storage**: Supabase Storage Buckets (`evidence-photos`, `issue-reports`, `avatar-images`, `mission-proofs`)
- **AI Models**: Google Gemma 4 26B Vision (`google/gemma-4-26b-a4b-it:free` via OpenRouter API)
- **Maps**: Leaflet & OpenStreetMap (via `leaflet` and `react-leaflet`, HTML5 Geolocation API, Haversine Distance)
- **Deployment**: Vercel / Netlify / Supabase Cloud
- **Package Manager**: npm (`package-lock.json`)
- **Styling**: Tailwind CSS, Emotion, Material UI, Vanilla CSS
- **State Management**: React Context API (`AuthContext`), React Query (`@tanstack/react-query`)
- **Language**: TypeScript 5.7
- **Framework**: Next.js 15.1 (React 19)

---

# Project Structure

```
Kindra/
├── app/                      # Next.js 15 App Router pages & API routes
│   ├── (auth)/               # Authentication pages (login, register, reset-password)
│   ├── admin/                # Municipal Admin Portal (analytics, user management, audit logs)
│   ├── api/                  # Backend API Route Handlers (evidence, gemma, karma)
│   ├── auth/callback/        # OAuth authentication callback handler
│   ├── citizen/              # Citizen Portal (dashboard, report, verification, leaderboard, rewards, profile)
│   ├── officer/              # Municipal Officer Portal (incident queue, report detail, live map)
│   ├── partner/              # NGO/Corporate Partner Portal (campaigns, reward catalog)
│   ├── layout.tsx            # Global app layout with providers & theme wrapper
│   ├── page.tsx              # Public landing page with features showcase
│   └── providers.tsx         # Global context providers (React Query, Auth)
├── components/               # Core React UI components
│   ├── auth/                 # Auth guards & login/register forms
│   ├── citizen/              # Citizen gamification components (Karma animations, LevelUp modal, LevelProgress card)
│   ├── core/                 # Animated UI primitive components (Framer Motion wrappers, glow effects, text loops)
│   ├── landing/              # Landing page marketing components
│   ├── maps/                 # Map components (LiveMap with Leaflet, LocationPicker)
│   ├── reports/              # Issue reporting UI components
│   ├── ui/                   # Shared UI elements (Material 3 Navigation Drawer, Top App Bar, Gemma error cards)
│   └── verification/         # Mission verification status & modal components
├── contexts/                 # React Context providers (AuthContext.tsx)
├── hooks/                    # Custom React hooks (useAuth, useGeolocation, useCitizenDashboard)
├── lib/                      # Core business logic, AI engines, & database utilities
│   ├── evidence/             # Perceptual hashing (dHash) & duplicate detection engine
│   ├── gemma/                # Gemma Vision AI engine (classification, mission profiles, error handler)
│   ├── karmaProgression.ts   # Level XP rules, title config, and progress calculations
│   ├── mockData.ts           # Demo & fallback data fixtures
│   ├── openrouter.ts         # OpenRouter API client wrapper for Gemma Vision AI model
│   └── supabase.ts           # Supabase browser & server client initializers
├── middleware.ts             # Next.js request middleware for session validation & route guards
├── public/                   # Static assets (images, icons, hero illustrations)
├── scripts/                  # CLI test scripts for verification, duplicate checks, and API validation
├── services/                 # Supabase data services (auth, mission, report, karma, badge, partner)
├── src/                      # Supplementary views and legacy components
│   ├── components/           # Floating AI assistant button, search modal, role-specific views
│   └── lib/                  # Helper utilities
├── supabase/                 # Supabase database configuration & SQL migrations
│   └── migrations/           # 7 sequential SQL migrations (RLS, schema, RPC functions, indexes)
├── tests/                    # Jest / Node test suites (karma progression, reward engine tests)
├── .env.local                # Local environment variables
├── package.json              # Dependencies and npm scripts
└── tailwind.config.js        # Tailwind CSS styling configuration
```

### Purpose of Major Folders

- **`app/`**: Contains the Next.js 15 App Router structure, defining page routes, nested portal layouts, and serverless API endpoints.
- **`components/`**: Modular, reusable UI components organized by domain (Auth, Citizen, Maps, Core Animations, Shared UI).
- **`contexts/`**: Global React Context providers managing client state like user authentication and authorization.
- **`hooks/`**: Custom React hooks encapsulating stateful logic for geolocation, auth, and dashboard data fetching.
- **`lib/`**: Business logic modules including the Gemma AI vision pipeline, perceptual image hashing, level calculation, and API client initializers.
- **`services/`**: Data access layer communicating with Supabase tables, storage buckets, and remote RPC functions.
- **`supabase/`**: Database migrations containing SQL schema definitions, Row Level Security (RLS) policies, indexes, and custom stored procedures.
- **`scripts/`**: CLI verification scripts for testing AI model classification, duplicate prevention, and error handling locally.
- **`public/`**: Static media assets including public illustrations, icons, and hero graphics.

---

# Installation

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (Package manager used in this repository)
- A Supabase project account
- An OpenRouter API key

### 1. Clone the Repository

```bash
git clone https://github.com/abhipaul18/Kindra.git
cd Kindra
```

### 2. Install Dependencies

KINDRA uses `npm` as its detected package manager (`package-lock.json` present in root).

```bash
npm install
```

---

# Environment Variables

Create a `.env.local` file in the project root directory by copying the example environment file:

```bash
cp .env.local.example .env.local
```

### `.env.example`

```env
# ==========================================
# Supabase Database & Auth Configuration
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_PROJECT_REF=your-project-ref

# ==========================================
# OpenRouter AI (Gemma Vision) Configuration
# ==========================================
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
NEXT_PUBLIC_OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free

# ==========================================
# Application Site Configuration
# ==========================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Variable Explanations

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client & Server) | The HTTPS endpoint URL for your Supabase project instance. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client & Server) | The anonymous public API key for Supabase data operations governed by RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Private (Server only) | High-privilege secret key used for administrative database operations (e.g., automated Karma awarding API route). |
| `SUPABASE_PROJECT_REF` | Private (Server/CLI) | The unique reference string identifying your Supabase project. |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | Public (Client/Server) | API key obtained from OpenRouter.ai to invoke the Gemma Vision AI model. |
| `OPENROUTER_API_KEY` | Private (Server only) | Server-side fallback API key for OpenRouter AI operations. |
| `NEXT_PUBLIC_OPENROUTER_MODEL` | Public (Client/Server) | The specific Gemma model identifier to use (default: `google/gemma-4-26b-a4b-it:free`). |
| `OPENROUTER_MODEL` | Private (Server only) | Server-side fallback model specification string. |
| `NEXT_PUBLIC_SITE_URL` | Public (Client & Server) | Base application URL used for OAuth redirects and auth callback links. |

---

# Running the Project

Commands defined in `package.json`:

### Development Mode

Starts the local development server with hot reloading on [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

### Production Build

Compiles TypeScript code, optimizes client bundles, and generates production build artifacts:

```bash
npm run build
```

### Production Server

Starts the Node.js production server to serve the built Next.js application:

```bash
npm start
```

### Code Linting

Runs ESLint to check for code style issues and potential syntax errors:

```bash
npm run lint
```

### Type Checking

Runs the TypeScript compiler (`tsc --noEmit`) to verify type safety across the entire project without generating output files:

```bash
npm run type-check
```

---

# Database Setup

KINDRA uses Supabase (PostgreSQL) for authentication, database storage, file management, and real-time updates.

### 1. Create Supabase Project

1. Log into [Supabase Dashboard](https://supabase.com/dashboard) and click **New Project**.
2. Note down your project **URL**, **Anon Key**, and **Service Role Key** under Project Settings -> API.

### 2. Configure Authentication

1. Navigate to **Authentication** -> **Providers**.
2. Ensure **Email** auth is enabled.
3. (Optional) Enable **Google** provider by supplying your Google OAuth Client ID and Secret.
4. Under **URL Configuration**, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to Redirect URLs.

### 3. Create Storage Buckets

Navigate to **Storage** -> **New Bucket** and create the following **Public** buckets:
- `evidence-photos`: Stores photo uploads for volunteer mission proof.
- `issue-reports`: Stores image evidence submitted with civic infrastructure reports.
- `avatar-images`: Stores user profile pictures.
- `mission-proofs`: Stores auxiliary verification attachments.

Ensure file size limits are set to 10MB and allowed MIME types are `image/jpeg, image/png, image/webp`.

### 4. Apply Database Migrations

Run all 7 migration scripts in sequence inside your Supabase **SQL Editor**:

1. [20260730000000_initial_schema.sql](file:///d:/AntiGravity/Kindra/supabase/migrations/20260730000000_initial_schema.sql) - Base tables (`profiles`, `reports`, `categories`, `departments`)
2. [20260730000001_kindra_next_schema.sql](file:///d:/AntiGravity/Kindra/supabase/migrations/20260730000001_kindra_next_schema.sql) - Next-generation schemas and role definitions
3. [20260730000002_phase1_backend_foundation.sql](file:///d:/AntiGravity/Kindra/supabase/migrations/20260730000002_phase1_backend_foundation.sql) - RLS policies and table structures
4. [20260730000003_performance_indexes_and_rls_hardening.sql](file:///d:/AntiGravity/Kindra/supabase/migrations/20260730000003_performance_indexes_and_rls_hardening.sql) - Performance indexes on spatial coordinates and report status
5. [20260730000004_gemma_verification_engine.sql](file:///d:/AntiGravity/Kindra/supabase/migrations/20260730000004_gemma_verification_engine.sql) - AI results schema (`report_ai_results`)
6. [20260730000005_mission_evidence.sql](file:///d:/AntiGravity/Kindra/supabase/migrations/20260730000005_mission_evidence.sql) - Perceptual hash tracking table (`mission_evidence`)
7. [20260731000000_karma_reward_engine.sql](file:///d:/AntiGravity/Kindra/supabase/migrations/20260731000000_karma_reward_engine.sql) - Transaction-safe `award_karma_points` RPC function and `karma_transactions` table

### 5. Realtime Configuration

Enable Supabase Realtime on the `reports` and `notifications` tables in the Supabase Dashboard under **Database** -> **Publications** (`supabase_realtime`).

---

# AI Verification Setup

KINDRA leverages Google's Gemma 4 26B Vision model to automatically analyze photo evidence and verify civic deed completion.

### OpenRouter & Gemma Configuration

1. Register an account on [OpenRouter.ai](https://openrouter.ai).
2. Generate an API Key and add it to `.env.local` as `NEXT_PUBLIC_OPENROUTER_API_KEY`.
3. Default model configured: `google/gemma-4-26b-a4b-it:free`.

### Image Verification Flow

```
1. Citizen uploads photo evidence for a mission or civic issue.
   │
2. Client computes 64-bit dHash perceptual fingerprint.
   │
3. Check `mission_evidence` table in Supabase for matching hash (Hamming distance ≤ 10).
   ├── Match Found ──> Reject as Duplicate Submission
   └── Unique Hash ──> Proceed to Gemma AI Analysis
   │
4. Image URL + Mission Prompt sent to OpenRouter API (google/gemma-4-26b-a4b-it:free).
   │
5. Gemma Vision evaluates:
   - Primary Object Detection (e.g. tree sapling, trash bag, pothole repair)
   - Environmental Context & Lighting
   - Verification Confidence Score (0–100%)
   - Infrastructure Severity Rating (Low, Medium, High, Critical)
   │
6. Verification Result:
   ├── Score ≥ 70% ──> Approved ──> Trigger `award_karma_points` RPC ──> Notify User
   └── Score < 70% ──> Routed to Officer Manual Review Queue
```

### Duplicate Detection Engine

- Uses a 64-bit difference hash (`dHash`) calculated across gray-scaled image quadrants.
- Prevents users from submitting the same downloaded or previously used photo multiple times.
- Stores hashes in `mission_evidence` with reference to `user_id` and `mission_id`.

### Current Limitations

- **Rate Limits**: OpenRouter free-tier models (`:free`) enforce per-minute rate limits. (Handled via `gemmaApiErrorHandler` exponential retries).
- **Lighting & Resolution**: Extreme low-light photos or images under 300px resolution may yield reduced confidence scores.
- **Geofence Dependency**: Relies on browser-provided GPS coordinates when metadata is missing from web uploads.

---

# Folder Configuration

Where developers should place new code additions:

- **Assets**: Place static images, illustrations, and icons in `public/`.
- **Components**: Add React components to `components/<domain>/` (e.g., `components/citizen/`, `components/reports/`, `components/ui/`).
- **Utilities**: Place mathematical helpers, formatters, and hashing logic in `lib/`.
- **Services**: Place Supabase data fetching, insert, and update operations in `services/` (e.g., `services/missionService.ts`).
- **Types**: Define TypeScript interfaces in `types/` or inline inside service domain files.
- **Hooks**: Place custom stateful React hooks in `hooks/`.
- **Supabase**: Place new database SQL migration scripts in `supabase/migrations/` using timestamp prefixing (`YYYYMMDDHHMMSS_name.sql`).
- **AI Engine**: Place prompt templates, vision evaluation models, and classifier scripts in `lib/gemma/`.

---

# Scripts

### Package Scripts (`package.json`)

- `npm run dev`: Starts the Next.js development server on port 3000 with fast refresh.
- `npm run build`: Compiles production build artifacts and verifies static optimization.
- `npm start`: Starts the Next.js production server for deployment environments.
- `npm run lint`: Executes ESLint across all `.ts` and `.tsx` files.
- `npm run type-check`: Executes `tsc --noEmit` to validate TypeScript type correctness.

### Standalone Test Scripts (`scripts/`)

Run these using `npx ts-node`:

- `npx ts-node scripts/test-all-missions.ts`: Executes Gemma AI classification tests against all default mission profiles.
- `npx ts-node scripts/test-api-error-handler.ts`: Tests fallback responses and error parsing when OpenRouter API encounters network failures or rate limits.
- `npx ts-node scripts/test-duplicate-prevention.ts`: Validates 64-bit dHash generation and duplicate photo rejection logic.
- `npx ts-node scripts/test-mission-verification.ts`: Tests end-to-end verification pipeline against sample test images.
- `npx ts-node scripts/test-primary-object-verification.ts`: Tests object recognition thresholding for specific civic items.

---

# Screenshots

### Landing Page

![Landing Page](./public/hero_illustration.png)

*Modern SaaS landing page introducing KINDRA, live platform statistics, and citizen portal navigation.*

### Dashboard

![Dashboard](./public/orphanage_elderly.png)

*Citizen Dashboard displaying lifetime Karma points, current level progress, active rank badges, and recent activity.*

### Mission Details

*Interactive mission discovery page detailing volunteer tasks, location pin on Leaflet map, and reward breakdown.*

### AI Verification

*Real-time Gemma 4 Vision AI verification modal displaying confidence score breakdown and Karma award status.*

### Leaderboard

*Community ranking leaderboard showcasing top civic contributors and total impact metrics.*

### Profile

*Citizen profile view featuring unlocked digital credentials, achievement badges, and activity history.*

---

# Contributing

We welcome contributions from developers, civic tech enthusiasts, and designers!

### Guidelines

1. **Fork & Clone**: Fork the repository on GitHub and clone it locally.
2. **Branch Naming Convention**:
   - `feat/feature-description` (e.g. `feat/offline-drafts`)
   - `fix/issue-description` (e.g. `fix/leaflet-map-resize`)
   - `docs/readme-update`
   - `refactor/service-layer`
3. **Commit Message Format**: Follow Conventional Commits:
   - `feat: add level progress card component`
   - `fix: handle openrouter 429 rate limit error`
   - `docs: update setup instructions in README`
4. **Code Quality**: Ensure all code passes type checking and linting before submitting a Pull Request:
   ```bash
   npm run type-check
   npm run lint
   ```
5. **Pull Request Process**: Submit PR against the `main` branch with a clear summary of changes, screenshot (if UI modification), and testing evidence.

---

# Roadmap

### Completed

- [x] Next.js 15 App Router foundation with Supabase Auth (Email & Google OAuth).
- [x] Multi-role portals for Citizens, Officers, Partners, and Admins.
- [x] OpenRouter Google Gemma 4 26B Vision AI verification integration.
- [x] Perceptual 64-bit dHash duplicate image detection engine.
- [x] Interactive Leaflet & OpenStreetMap mapping with HTML5 Geolocation.
- [x] Atomic Supabase Postgres transaction `award_karma_points` RPC engine.
- [x] 10-tier leveling progression with animated level-up modal feedback.
- [x] Responsive Material Design 3 interface with Framer Motion animations.
- [x] Ask Gemma conversational AI assistant.

### In Progress

- [ ] Offline-first local storage queuing for report submissions in low-connectivity zones.
- [ ] Push notifications and SMS alerts for officer resolution updates.
- [ ] Municipal department auto-assignment rules based on issue categories.

### Planned

- [ ] Verifiable on-chain civic achievement badges and credentials.
- [ ] Native iOS and Android mobile apps built with React Native / Expo wrapper.
- [ ] Multi-language support expanding beyond English, Hindi, and Kannada.

---

# Known Issues

1. **OpenRouter Free Tier Rate Limits**: Frequent, rapid image verification requests sent to `google/gemma-4-26b-a4b-it:free` may return HTTP 429 errors. *Workaround*: Handled gracefully by `gemmaApiErrorHandler` with fallback states and retries.
2. **Leaflet SSR Window Guard**: Importing Leaflet directly on server components causes `window is not defined` error. *Workaround*: Leaflet components are wrapped using `next/dynamic` with `ssr: false`.
3. **Browser GPS Reliance**: HTML5 Geolocation API relies on browser permissions and device location hardware, which can be spoofed in desktop browser devtools if photo EXIF data is absent.

---

# License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

# Contact & Community

- **GitHub Repository**: [https://github.com/abhipaul18/Kindra](https://github.com/abhipaul18/Kindra)
- **Report Bugs & Feature Requests**: [GitHub Issues](https://github.com/abhipaul18/Kindra/issues)
- **Community Discussions**: [GitHub Discussions](https://github.com/abhipaul18/Kindra/discussions)

---

# Run Guide

A step-by-step walkthrough for a completely new developer setting up KINDRA from scratch.

### Step 1: Install Node.js
Download and install Node.js (v18.x or v20.x LTS) from [nodejs.org](https://nodejs.org). Confirm installation:
```bash
node -v
npm -v
```

### Step 2: Clone Repository
```bash
git clone https://github.com/abhipaul18/Kindra.git
cd Kindra
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Configure Environment Variables
Create `.env.local` in the project root:
```bash
cp .env.local.example .env.local
```
Fill in your Supabase project credentials and OpenRouter API key.

### Step 5: Create Supabase Project
Sign up at [supabase.com](https://supabase.com) and create a new project. Copy the API URL andAnon key into `.env.local`.

### Step 6: Configure Authentication
In Supabase Dashboard under **Auth** -> **URL Configuration**, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to Redirect URLs.

### Step 7: Create Storage Buckets
In Supabase Dashboard under **Storage**, create public buckets: `evidence-photos`, `issue-reports`, `avatar-images`, `mission-proofs`.

### Step 8: Apply Database Schema & Migrations
In Supabase SQL Editor, execute all SQL scripts in `supabase/migrations/` in chronological order (`20260730000000` to `20260731000000`).

### Step 9: Configure OpenRouter API Key
Sign up on [openrouter.ai](https://openrouter.ai), generate an API key, and set `NEXT_PUBLIC_OPENROUTER_API_KEY` in `.env.local`.

### Step 10: Configure Maps
KINDRA uses Leaflet and OpenStreetMap. No setup or key required; ensure your machine has an active internet connection to download map tiles.

### Step 11: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 12: Build for Production
```bash
npm run build
```

### Step 13: Deploy
Deploy the codebase to Vercel, Netlify, or your preferred cloud host by connecting the GitHub repository and adding the `.env.local` environment variables.

---

### Troubleshooting Common Errors

- **Missing Environment Variables**:
  - *Symptom*: Client error `Supabase URL is required` or API key missing.
  - *Fix*: Ensure `.env.local` exists in the root folder, keys start with `NEXT_PUBLIC_`, and restart the Next.js server (`npm run dev`).

- **Supabase Connection Failed**:
  - *Symptom*: 401 Unauthorized or network connection refused error in console.
  - *Fix*: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your Supabase dashboard API credentials.

- **Authentication Errors / OAuth Callback Loop**:
  - *Symptom*: OAuth login redirects back to login page without authenticating.
  - *Fix*: Ensure `http://localhost:3000/auth/callback` is added to Supabase **Auth Redirect URLs** and `NEXT_PUBLIC_SITE_URL` is set to `http://localhost:3000`.

- **Storage Bucket Not Found**:
  - *Symptom*: Photo upload throws 404 error `Bucket evidence-photos not found`.
  - *Fix*: Create the storage bucket in Supabase Storage dashboard and toggle **Public Bucket** to ON.

- **OpenRouter API Errors / 429 Rate Limit**:
  - *Symptom*: AI verification fails or hangs with rate limit warning.
  - *Fix*: Wait 60 seconds for OpenRouter free tier limit reset or supply a paid OpenRouter API key.

- **AI Verification Errors**:
  - *Symptom*: Verification returns low confidence or unverified status.
  - *Fix*: Ensure uploaded test photo is clear, well-lit, and displays the required target object matching the mission profile.

- **CORS Issues**:
  - *Symptom*: Browser blocks API request with CORS error.
  - *Fix*: Ensure API calls go through Next.js API routes or Supabase domains configured in project settings.

- **Port Already in Use**:
  - *Symptom*: `Error: listen EADDRINUSE: already in use :::3000`.
  - *Fix*: Run dev server on an alternate port: `npm run dev -- -p 3001` or kill the running process using `taskkill /F /IM node.exe` (Windows).

- **Dependency Installation Failures**:
  - *Symptom*: `npm install` errors out with peer dependency mismatch.
  - *Fix*: Run `npm install --legacy-peer-deps` or clear node modules and reinstall: `rm -rf node_modules package-lock.json && npm install`.
