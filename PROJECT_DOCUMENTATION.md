# WorkFlow — Global Human Resource Management System (HRMS)

> **Version:** 1.0 &nbsp;|&nbsp; **Status:** Development &nbsp;|&nbsp; **Last Updated:** July 2026

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Highlights](#2-key-highlights)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Functional Modules](#7-functional-modules)
8. [Role-Based Access Control (RBAC)](#8-role-based-access-control-rbac)
9. [Project Folder Structure](#9-project-folder-structure)
10. [API & Data Layer](#10-api--data-layer)
11. [UI / UX Design System](#11-ui--ux-design-system)
12. [Security & Authentication](#12-security--authentication)
13. [Environment Setup & Configuration](#13-environment-setup--configuration)
14. [Build & Deployment](#14-build--deployment)
15. [Testing Strategy](#15-testing-strategy)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Project Overview

**WorkFlow** is a comprehensive, enterprise-grade Human Resource Management System designed to centralize and automate the entire employee lifecycle — from pre-joining onboarding through attendance, leave, payroll, expenses, performance, learning, recognition, recruitment, and people analytics.

The platform supports **four distinct user roles** (Employee, Manager, HR, Admin), features an **embedded AI HR Copilot**, and is designed for **multi-country operations** (United States and India at launch) with localized payroll and statutory compliance handling.

### What Problem Does It Solve?

Traditional HR operations involve fragmented tools — one for attendance, another for leave, a separate system for payroll, and spreadsheets for everything else. WorkFlow eliminates this fragmentation by providing a **single, unified platform** that:

- Reduces manual HR administrative effort by **automating routine workflows**
- Provides **role-tailored experiences** so each user sees only what is relevant to them
- Ensures **compliance** with country-specific payroll and statutory regulations
- Increases **employee engagement** through gamified contributions, recognition, and transparent performance management
- Offers **AI-powered assistance** for instant HR query resolution

---

## 2. Key Highlights

| Feature | Description |
|---|---|
| **16 Functional Modules** | Dashboard, Onboarding, Attendance, Leave, Payroll, Documents, Expenses, Performance, Contributions, Training, Recruitment, Recognition, Announcements, Team, Analytics, HR Copilot |
| **4 User Roles** | Employee, Manager, HR Specialist, System Administrator |
| **Multi-Country Payroll** | India (PF, ESI, PT, LWF, Gratuity) and US (Federal/State Tax, 401k, Social Security) |
| **AI HR Copilot** | Context-aware AI assistant powered by Groq SDK, available on every screen |
| **Dark & Light Theme** | System-synced theme toggle with smooth transitions |
| **Global Search** | Instant search across pages, actions, people, documents, and training |
| **Real-time Notifications** | Categorized notification system with read/unread management |
| **Interactive Dashboard** | Role-specific widgets, charts, and quick actions |
| **48 User Stories** | Fully documented acceptance criteria for every feature |

---

## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Vite** | 8.x | High-speed frontend tooling and bundler |
| **React** | 19.2.0 | UI library |
| **React Router** | 7.x | Client-side routing and layout rendering |
| **TypeScript** | 5.x | Static type safety across components and utilities |
| **Tailwind CSS** | 4.x | Utility-first CSS styling engine |
| **Lucide React** | 1.21.0 | Standard production SVG icon library |
| **Zustand** | 5.0.8 | UI local state management |
| **Redux Toolkit** | 2.11.0 | Global cross-feature state store |
| **Apollo Client** | 4.0.9 | GraphQL API client |
| **GraphQL** | 16.12.0 | Flex query language for recruitment integrations |
| **React Select** | 5.10.2 | Custom selects and tags |
| **React DatePicker** | 8.9.0 | Date picker select grids |
| **TanStack React Table** | 8.21.3 | Headless grid tables |
| **Groq SDK** | 1.3.0 | AI assistant chatbot query processor |
| **Zod** | 4.1.13 | Input schema validators |
| **JS Cookie** | 3.0.5 | Cookie token manager |

### Backend (MERN Express Stack)

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20.x | JavaScript runtime environment |
| **Express.js** | 4.18.2 | REST and middleware API container |
| **Apollo Server** | 4.10.0 | GraphQL gateway |
| **MongoDB / Mongoose** | 8.2.1 | MongoDB ODM and schema definitions |
| **Groq SDK** | 1.3.0 | Backend SDK client to execute AI chat completions |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │  Vite React  │  │  Tailwind    │  │  Zustand / Redux     │  │
│   │  (Router v7) │  │  CSS 4       │  │  State Management    │  │
│   └──────┬───────┘  └──────────────┘  └──────────────────────┘  │
│          │                                                      │
│   ┌──────▼───────────────────────────────────────────────────┐  │
│   │              Apollo Client (GraphQL)                     │  │
│   └──────┬───────────────────────────────────────────────────┘  │
└──────────┼──────────────────────────────────────────────────────┘
           │  HTTPS / GraphQL / REST
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                     BACKEND SERVER (Express)                    │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │                  Express.js Endpoint                     │   │
│   │                     (server.js)                          │   │
│   └──────┬────────────────────┬──────────────────────────────┘   │
│          │                    │                                   │
│   ┌──────▼────────────┐  ┌────▼─────────────┐                   │
│   │   Apollo Server   │  │   REST Routing   │                   │
│   │     (/graphql)    │  │  (/api/copilot)  │                   │
│   └──────┬────────────┘  └────┬─────────────┘                   │
│          │                    │                                 │
│   ┌──────▼────────────────────▼──────────────────────────────┐   │
│   │               Mongoose ODM (MongoDB Models)              │   │
│   └───────────────────────────┬──────────────────────────────┘   │
│                               │                                 │
│                     ┌─────────▼─────────┐                       │
│                     │ MongoDB database  │                       │
│                     └───────────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Frontend Architecture

### Code Directory Structure

The frontend is a single page application built on Vite:

```
src/
├── main.tsx             # ReactDOM mount entry
├── App.tsx              # App Routing configuration + Context Providers
├── providers.tsx        # Store, Apollo, User context wrappers
├── vite-env.d.ts        # Vite client types & environment mappings
├── globals.css          # CSS theme imports + custom dark variables
│
├── pages/               # Page Components (16 modules)
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AttendancePage.tsx
│   ├── LeavePage.tsx
│   ├── PayrollPage.tsx
│   ├── DocumentsPage.tsx
│   ├── ExpensesPage.tsx
│   ├── PerformancePage.tsx
│   ├── ContributionsPage.tsx
│   ├── TrainingPage.tsx
│   ├── RecruitmentPage.tsx
│   ├── RecognitionPage.tsx
│   ├── AnnouncementsPage.tsx
│   ├── TeamPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── CopilotPage.tsx
│   ├── OnboardingPage.tsx
│   └── NotFoundPage.tsx
│
├── components/          # Global UI Layout Components
│   ├── DashboardLayout.tsx  # Interactive header (search, notify, profile, theme)
│   ├── Sidebar.tsx          # Nav layout with role restrictions
│   ├── RoleSwitcher.tsx     # Demo switcher floating button
│   ├── ProtectedRoute.tsx   # Auth guard checking cookies
│   └── table/               # Headless grid wrapper
│
├── context/             # Session & User contexts
│   ├── UserContext.tsx
│   └── SessionContext.tsx
│
├── store/               # Redux state slices
│   ├── index.ts
│   └── authSlice.ts
│
├── stores/              # Zustand state slices
│   └── uiStore.ts
│
├── lib/                 # Core mock layers and GraphQL clients
│   ├── mockData.ts      # Core HR datasets
│   ├── apolloClient.ts  # Apollo configuration
│   └── auth/            # Auth storage and utils
│
└── types/               # Type declarations
    └── index.ts
```

### Core Navigation & Controls

- **ProtectedRoute**: Replaces server middleware by performing client redirect guards to `/login` if `auth_token` is missing.
- **DashboardLayout**: Coordinates theme, command line searches, notification drawers, and user statistics.
- **RoleSwitcher**: Allows seamless toggling of users for active RBAC presentation.

---

## 6. Backend Architecture

The Node backend is a unified Express app combining Apollo GraphQL server integration and REST routers:

```
backend/
├── server.js            # Express app setup, Mongoose models, GraphQL resolvers, REST routes
├── package.json         # Node scripts & dependencies
└── .env                 # Port, MongoDB URI, Groq Keys
```

### Execution Flow
1. Start script launches `server.js`.
2. Server establishes a connection to MongoDB (falls back to a robust in-memory mock dataset if MongoDB is not installed).
3. If connected to MongoDB, seeds collections (`JobPosting`, `Candidate`) if they are empty.
4. Mounts Apollo Server middleware at `/graphql`.
5. Mounts REST post controller `/api/copilot`.

---

## 7. Functional Modules

Detailed overview of the 16 core functional modules available in Section 4 of `spec_extracted.txt`.

---

## 8. Role-Based Access Control (RBAC)

RBAC details can be found under Section 8 of the original specifications.

---

## 9. API & Data Layer

### GraphQL Integration
Used exclusively by the Recruitment page to fetch active postings and modify candidates:

```graphql
query GetAllJobPostings {
  getAllJobPostings {
    data {
      jobPostings {
        jobPostingId
        title
        department
        location
      }
    }
  }
}

mutation UpdateCandidateStage($request: UpdateCandidateStageRequestInput!) {
  updateCandidateStage(request: $request) {
    data {
      candidateId
    }
    success
  }
}
```

### AI Copilot REST API
Executes requests to Groq SDK:
```
POST /api/copilot
Body: { messages, userContext }
Response: { reply }
```

---

## 10. Environment Setup & Configuration

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** (Optional, will use in-memory fallback if not available)

### Quick Start

1. **Clone & Setup Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file with process keys (see details below)
   npm start
   ```

2. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### Dotenv Files

**backend/.env**
```env
PORT=5000
GROQ_API_KEY=your_key_here
MONGO_URI=mongodb://localhost:27017/workflow_hrms
```

**frontend/.env**
```env
VITE_GRAPHQL_URL=http://localhost:5000/graphql
VITE_API_URL=http://localhost:5000
```
