# 🚀 DevForge — AI-Powered Web App Builder & Lead Generation Platform

> **Build, Preview, Scrap Leads, and Deploy Full-Stack Web Applications in Seconds with AI.**

DevForge is an all-in-one AI platform that empowers developers, agencies, and businesses to generate modern, responsive, full-stack websites and web applications from simple text prompts. It features a streaming code bundler, real-time live preview, an automated lead extraction engine, client outreach tools, and 1-click GitHub & Vercel deployment.

---

## ⚡ Key Features

- **🤖 Instant AI Web Generation**: Type any website or web app prompt and watch DevForge compile responsive TypeScript/React and HTML/CSS code in real-time. Powered by **Google Gemini AI** and **Anthropic Claude** with dynamic fallback engines.
- **💻 Dual Sandpack & Instant Preview Engine**: Includes an interactive CodeSandbox-powered Sandpack IDE (with live code editor, console, and error overlay) along with a fallback instant browser-compiled preview engine for zero-lag rendering.
- **🎯 B2B Lead Finder & Business Scraper**: Discover potential local clients without websites! Search by industry and location (e.g. *"Dentists in Chicago"* or *"Restaurants in Karachi"*), extract business details, contact phone numbers, emails, addresses, ratings, and export leads to CSV.
- **💬 Client Outreach Assistant**: Built-in AI chat assistant with schema-driven lead capture and automated client proposal generation.
- **🎨 Visual No-Code Style Inspector**: Inspect and adjust colors, typography, layout tokens, and themes with instant updates.
- **🚀 1-Click Deployment Pipeline**: Seamlessly push generated projects straight to GitHub repositories and trigger automated production builds on Vercel.
- **🌐 Internationalization (i18n) & RTL**: Native multi-language support (English, Urdu, Spanish, Arabic, etc.) with automated RTL layout handling.
- **🔒 Authentication & Data Persistence**: NextAuth session management backed by PostgreSQL & Prisma ORM.

---

## 📁 Repository Structure & Organization

```
devforge/
├── app/                        # Next.js App Router (Pages, API Routes, Layouts)
│   ├── api/                    # Serverless API Handlers
│   │   ├── auth/               # NextAuth Authentication & GitHub OAuth
│   │   ├── chat/               # Assistant & Tool-Calling Lead Extraction
│   │   ├── deploy/             # GitHub Repository & Vercel Deployment Automation
│   │   ├── generate/           # AI Web Code Generation (Gemini & Anthropic)
│   │   ├── leads/              # Lead Data Storage & Export Endpoints
│   │   ├── scrape-leads/       # OSM & Maps Business Lead Search Engine
│   │   └── webhook/            # Deployment Status Webhooks
│   ├── layout.tsx              # Root HTML Layout & Providers
│   └── page.tsx                # Main Application Workspace (Builder + Leads + Preview)
├── components/                 # React UI Components
│   ├── ChatWidget.tsx          # Assistant & Lead Capture Drawer
│   ├── DeployStepper.tsx       # Live Deployment Tracker Modal
│   ├── LanguageSelector.tsx    # i18n Language Picker
│   ├── LeadGenerationModal.tsx # Lead Search & Extraction Suite
│   ├── SandpackPreview.tsx     # Code Editor & Instant Live Preview Engine
│   ├── StyleInspector.tsx      # Visual Style & Theme Editor
│   └── TemplateGrid.tsx       # Starter Web Application Templates
├── lib/                        # Utility Libraries & Configuration
│   ├── auth.ts                 # NextAuth Provider Config
│   ├── github.ts               # GitHub API Client (Octokit)
│   ├── i18n.ts                 # Multi-language Translations & RTL Logic
│   └── schemas.ts              # Zod Validation Schemas
├── prisma/                     # Database Schema & Migrations
│   └── schema.prisma           # Prisma PostgreSQL Models (User, Project, Lead)
├── public/                     # Static Assets, Icons, and Logos
├── scraper/                    # Optional Standalone Python / Docker Scraper Kit
│   ├── docker-compose.yml      # Containerized Scraper Service
│   └── scripts/                # Deep Google Maps Scraping Scripts
├── .env.example                # Template Environment Variables
├── middleware.ts               # Security & Route Middleware
├── next.config.mjs             # Next.js Configuration
└── package.json                # Project Dependencies & Scripts
```

---

## 🛠️ Prerequisites

Before getting started, make sure you have the following installed on your machine:
- **Node.js**: `v18.x` or higher ([Download Node.js](https://nodejs.org/))
- **npm** or **yarn** or **pnpm**
- **Git**: ([Download Git](https://git-scm.com/))
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## ⚙️ Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/syednehajafferyy/devforge.git
cd devforge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy the `.env.example` file to create your local `.env.local` configuration:
```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and add your credentials:
```env
# Required for Google Gemini AI Generation
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Required for NextAuth Sessions
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_string

# Optional: PostgreSQL Database connection string (for saving projects & leads)
DATABASE_URL=postgresql://user:password@localhost:5432/devforge?sslmode=disable

# Optional: Anthropic Claude API Key (fallback model)
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
```

> 🔑 **How to get a FREE Gemini API Key:**
> 1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
> 2. Sign in with your Google account.
> 3. Click **"Create API Key"** and copy the generated key into `GEMINI_API_KEY`.

### 4. Push Database Schema (Optional)
If using PostgreSQL for project persistence:
```bash
npx prisma db push
```

### 5. Launch Development Server
```bash
npm run dev
```

Open `http://localhost:3000` in your web browser to start using DevForge! 🎉

---

## 🌐 How to Make It Live (Deployment Guide)

Deploying DevForge to production is fast and easy using **Vercel**.

### Deploying to Vercel (Step-by-Step)

1. **Push Code to GitHub**:
   Ensure all changes are pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy DevForge"
   git push origin main
   ```

2. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
   - Select your GitHub repository: `syednehajafferyy/devforge`.

3. **Configure Environment Variables**:
   In the Vercel project configuration screen, expand **Environment Variables** and add:

   | Variable Name | Description / Value |
   |---|---|
   | `GEMINI_API_KEY` | Your Google Gemini API Key |
   | `GOOGLE_GENERATIVE_AI_API_KEY` | Same Google Gemini API Key |
   | `NEXTAUTH_URL` | Your production Vercel domain (e.g. `https://devforge.vercel.app`) |
   | `NEXTAUTH_SECRET` | Secret key for auth token encryption |
   | `DATABASE_URL` | PostgreSQL connection string (from Supabase or Neon) |

4. **Deploy**:
   - Click **Deploy**. Vercel will automatically build and publish your site.
   - Your live website URL will be ready in under 2 minutes (e.g. `https://devforge.vercel.app`)!

---

## 🗄️ Setting Up a Production Database (Supabase / Neon)

For live project saving and lead storage in production:
1. Create a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy the Connection String URL.
3. Add it to `DATABASE_URL` in your Vercel Environment Variables.
4. Run `npx prisma db push` locally pointing to your production database string to populate tables.

---

## 🕷️ Optional: Standalone Deep Scraper Microservice (`scraper/`)

DevForge includes a built-in OpenStreetMap fast lead finder out of the box. If you also want to run the advanced Google Maps Python scraper service:

```bash
cd scraper
docker-compose up -d --build
```
The scraper microservice will run on `http://localhost:8000`. You can set `SCRAPER_URL=http://localhost:8000` in your `.env.local`.

---

## 🧰 Built With

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [TailwindCSS](https://tailwindcss.com/), Lucide Icons
- **AI Engines**: Google Gemini AI (`@google/generative-ai`), Anthropic Claude (`@anthropic-ai/sdk`)
- **Code Execution**: [@codesandbox/sandpack-react](https://sandpack.codesandbox.io/)
- **Database & Auth**: [Prisma ORM](https://www.prisma.io/), [NextAuth.js](https://next-auth.js.org/), PostgreSQL
- **GitHub Integration**: [@octokit/rest](https://github.com/octokit/rest.js)

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
