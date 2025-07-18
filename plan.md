# ElysianVista: Multi-Tenant Real Estate SaaS Platform

## 🚧 Current Status (As of July 18, 2025)

The project is currently in Phase 1 of the roadmap. The core multi-tenant architecture and user authentication systems are complete. The basic UI for the dashboard and admin areas is in place.

Development is temporarily blocked on the "Listings CRUD" feature due to a technical issue with TypeScript path aliases in the frontend application. The files `client/src/pages/dashboard/NewListingPage.tsx` and `client/src/pages/dashboard/ListingsPage.tsx` require manual intervention to fix their import paths.

Once this issue is resolved, development will continue with the implementation of the "Read", "Update", and "Delete" functionalities for listings.

---

## 🌟 Overview

**ElysianVista** is a SaaS platform built for real estate agencies to manage, customize, and publish their own property listing websites. It features a unified dashboard for internal management and automatically generates a customizable, SEO-friendly public website for each agency.

This document defines the project's structure, goals, tech stack, roadmap, and initial feature set, optimized for solo development with future scaling in mind.

---

## 🚀 Vision

To empower real estate agencies with modern tools to manage listings, teams, and customer engagement through:

* A **freemium multi-tenant dashboard**
* Per-agency **customizable public websites**
* Scalable, developer-friendly backend and infrastructure

---

## 📊 Target Users

| Role          | Usage Scope                                     |
| ------------- | ----------------------------------------------- |
| Admin         | Configure agency, manage listings & users       |
| Manager       | Assign properties, handle leads, oversee agents |
| Agent         | Manage assigned listings, interact with leads   |
| Secretary     | Support role for agent tasks                    |
| Buyer/Visitor | Search listings, contact agents via public site |

---

## 📑 Project Architecture

### 🌐 URLs

* **Dashboard**: `app.elysianvista.com`
* **Public Site**: `agency-name.elysianvista.com` or custom domain (`exampleRealEstate.com`)

### ⚖️ Stack (BHVR)

* **Bun** – Runtime
* **Hono** – Server routing, SSR, and APIs
* **Vite** – Frontend tooling
* **React** – Component-based UI
* **Supabase** – Auth, DB (Postgres), Storage

### 🚪 Auth & Security

* Supabase Auth with RLS-based multi-tenancy
* Roles scoped to `tenant_id`
* Optional: Upgrade to Clerk for advanced auth

---

## 🛠️ MVP Features

### 📆 Dashboard

* Multi-tenant auth + team roles (Admin, Agent, etc)
* Agency profile & branding settings
* Listings CRUD (title, desc, media, status, etc)
* Image upload with Supabase Storage
* Basic public site theme customizations

### � Public Site (Per Tenant)

* Home, Listings, Listing Detail
* Agent Profile & Contact Form (connected to CRM)
* Filter & search: location, type, price, features
* SEO-friendly SSR via Hono
* Custom domain support

### 💳 Pricing (Freemium)

* Free: Basic features + ElysianVista branding
* Pro: Remove branding, custom domain, more listings
* Enterprise: White-label, MLS sync, CRM tools

---

## 📊 Roadmap (0 to 6 Months)

### Phase 1: Core MVP

* [ ] Multi-tenant setup with RLS
* [ ] Auth (email/password) via Supabase
* [ ] Dashboard UI (Admin/Agent roles)
* [ ] Listings CRUD with media
* [ ] Generate public site per tenant
* [ ] Subdomain routing + CNAME support

### Phase 2: Customization + Basic SaaS

* [ ] Theme editing (colors, logo, footer text)
* [ ] Simple plan limits (listing count, user roles)
* [ ] Stripe integration for billing
* [ ] Public site blog module (optional)

### Phase 3: CRM + Polish

* [ ] Lead inbox per agent
* [ ] Email notifications (Resend/Postmark)
* [ ] Dashboard analytics (basic listing views)
* [ ] Mobile responsiveness & accessibility

---

## 🌐 Hosting & DevOps

| Layer   | Platform            | Notes                       |
| ------- | ------------------- | --------------------------- |
| Web App | Vercel (or Coolify) | Vercel to start, move later |
| DB/Auth | Supabase Hosted     | Upgrade or self-host later  |
| Media   | Supabase Storage    | For property media          |
| Domains | CNAME routing       | Tenant custom domains       |

---

## 📈 Future Expansion Ideas

* MLS/API integration (Spitogatos, Spiti24)
* Calendar scheduling for property viewings
* Internal messaging (buyer-agent)
* React Native app / PWA
* Property analytics + conversion insights
* Agent commission and sales tracking
* Multi-language support (Greek/English)

---

## 📂 Dev Tooling & Libs

| Purpose    | Tool/Lib                 |
| ---------- | ------------------------ |
| UI         | ShadCN, Tailwind         |
| Icons      | Lucide-react             |
| Toasts     | Sonner                   |
| Forms      | React Hook Form + Zod    |
| Date/time  | Day.js / date-fns        |
| SEO/SSR    | Hono, react-helmet-async |
| State mgmt | Zustand (if needed)      |
| Testing    | Vitest, Playwright       |

---

## 🫵 Summary

* **Stack**: BHVR + Supabase hosted
* **Structure**: Monorepo fullstack
* **Focus**: MVP with real-world agency needs, clean dev experience
* **Business**: SaaS freemium model
* **Scalable**: Easily move to self-hosted, Prisma, or Clerk if needed
* **You**: Solo dev, so keep scope realistic & modular

Let me know when you're ready to convert this into a GitHub README, Trello board, or a pitch for clients!
