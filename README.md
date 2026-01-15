# AllMap Hostels Monorepo

[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-00c7b7.svg)](https://turborepo.org/)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Library-React%2019-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind%204-06b6d4)](https://tailwindcss.com/)

An industry-grade, unified platform for hostel management, student accommodation, and administrative oversight. Built with a focus on high performance, scalability, and a premium user experience.

---

## 🌐 Live Environments

Explore the AllMap ecosystem across our production environments:

- **Main Platform (Student App)**: [allmaphostels.com](https://allmaphostels.com) / [student.allmaphostels.com](https://student.allmaphostels.com)
- **Hostel Administrator Portal**: [admin.allmaphostels.com](https://admin.allmaphostels.com)
- **Super Admin Oversight**: [allmap-supa.vercel.app](https://allmap-supa.vercel.app/)

---

## 🏗 Project Architecture

This project is managed as a **Turborepo Monorepo**, ensuring code consistency, shared types, and efficient build caching across the entire ecosystem.

### Applications (`/apps`)
| Application | Description | Tech Stack |
| :--- | :--- | :--- |
| **`admin-app`** | Property management for hostel owners. Handles rooms, bookings, and revenue. | Next.js 15, React 19, Framer Motion |
| **`student-app`** | User-facing discovery and booking platform for students. | Next.js 15/16, HeroUI, Tailwind 4 |
| **`super-admin`** | Platform-level governance, user management, and system analytics. | Next.js 15, Radix UI, Recharts |

### Shared Packages (`/packages`)
- **`@repo/ui`**: A curated library of shared React components ensuring visual consistency.
- **`@repo/typescript-config`**: Standardized TS configurations for strict type safety.
- **`@repo/eslint-config`**: Shared linting rules (Next.js, Prettier) for code quality.

---

## 🛠 Technology Stack

- **Core**: React 19 & Next.js 15 (App Router)
- **Type Safety**: TypeScript 5+
- **Styling**: Tailwind CSS 4 (Beta/Native)
- **State Management**: React Context & Hooks
- **Animations**: Framer Motion for smooth, premium transitions
- **Components**: Radix UI, HeroUI, Lucide React
- **Build System**: Turborepo for optimized pipeline execution

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (>= 18.0.0)
- [npm](https://www.npmjs.com/) (>= 10.0.0)

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/alikamatu/allmap-hostels.git
   cd allmap-hostels
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run all apps in development mode**:
   ```bash
   npm run dev
   ```

4. **Build the entire project**:
   ```bash
   npm run build
   ```

---

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Deep dive into design decisions and data flow.
- [Contributing Standards](./CONTRIBUTING.md) - How to contribute to the codebase.
- [Deployment Guide](./docs/DEPLOYMENT.md) - CI/CD and hosting strategy.

---

## ⚖️ License

AllMap Hostels is proprietary software. All rights reserved.
