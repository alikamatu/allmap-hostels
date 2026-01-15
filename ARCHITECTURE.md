# Architecture Guide

This document outlines the technical architecture, design patterns, and system design of the AllMap Hostels platform.

## 🏛 Monorepo Strategy

The project utilizes a **Turborepo** monorepo structure. This allows us to:
- **Share Code**: Common UI components and utility functions are shared across all applications.
- **Unified Configuration**: ESLint, TypeScript, and Tailwind configurations are centralized.
- **Optimized Builds**: Remote caching and task orchestration significantly speed up CI/CD.

## 🗺 System Design

### Client Applications
1. **Student App**: Serves as the primary entry point. Orchestrates the discovery and booking flow. Optimized for mobile-first interactions.
2. **Admin App**: A sophisticated management dashboard. Features include bulk room creation, booking management, and real-time inventory tracking.
3. **Super Admin**: The "God-view" of the platform. Focuses on user verification, hostel approval, and financial oversight.

### Data Flow
- **API Interaction**: Applications communicate with a centralized backend via RESTful APIs.
- **State Management**: Primarily relies on React Server Components for data fetching, with Client-side Context for auth and interactive UI states.
- **Authentication**: JWT-based authentication managed through a unified `AuthContext` shared (conceptually) across apps.

## 🎨 Design System

We follow a **Component-Driven Development** (CDD) approach.
- **`@repo/ui`**: Contains atomic and molecular components (Button, Card, Input).
- **Tailwind CSS 4**: Utilizes the latest CSS-in-JS capabilities and high-performance JIT compilation.
- **Framer Motion**: Standardized animation durations and easings for a cohesive "premium" feel.

## 📦 Deployment Strategy

- **Hosting**: Deployed on **Vercel** for optimal Next.js performance.
- **CI/CD**: Automatic deployments triggered by branch merges (main/develop).
- **Environment Variables**: Managed per app via Vercel Environment Variables.
