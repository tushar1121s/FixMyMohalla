<div align="center">

# FixMyMohalla

**Enterprise-Grade Residential Society Maintenance & Grievance Redressal Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5.svg?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Brevo](https://img.shields.io/badge/Email-Brevo%20Transactional-0B99FF.svg?style=flat-square&logo=sendinblue&logoColor=white)](https://brevo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

*A production-grade, auditable workflow system replacing unstructured WhatsApp groups and physical logbooks with role-based ticket management, evidence photo verification, multi-admin committee escalation, dynamic priority scheduling, and automated transactional email workflows.*

</div>

---

## 📑 Table of Contents

- [Platform Overview](#-platform-overview)
- [System Architecture](#-system-architecture)
- [Key Features & Role Workflows](#-key-features--role-workflows)
  - [Resident Experience](#1-resident-experience)
  - [Society Operations & Admin Console](#2-society-operations--admin-console)
  - [Super Admin Security & Committee Management](#3-super-admin-security--committee-management)
  - [Design System & Studio Dark Mode](#4-design-system--studio-dark-mode)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Local Development Setup](#-local-development-setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Configuration Reference](#-environment-configuration-reference)
- [REST API Specification](#-rest-api-specification)
  - [Authentication, Profile & RBAC](#1-authentication-profile--rbac)
  - [Complaints Operations](#2-complaints-operations)
  - [Notice Board](#3-notice-board)
  - [Metrics & Analytics](#4-metrics--analytics)
- [Database Schema & Security Architecture](#-database-schema--security-architecture)
- [Production Deployment Guide](#-production-deployment-guide)
  - [Backend Deployment (Render)](#backend-deployment-render)
  - [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Platform Overview

Residential societies frequently struggle with grievance handling due to chaotic instant-messaging chats, lack of status accountability, unorganized photo attachments, and lost records.

**FixMyMohalla** provides a high-reliability, transparent operating system for apartment complexes and gated societies:

- **Immutable Audit Trails**: Every status transition (`Open` → `In Progress` → `Resolved`), priority modification, and administrative remark is permanently logged with timestamps and administrative IDs.
- **Dynamic Priority-First Queue with FIFO Tie-Breaker**: Critical escalations (`High` priority) dynamically bubble to the top of the queue. If priorities tie, older complaints are served first (FIFO fairness).
- **Multi-Admin Transactional Broadcast**: When any resident submits a ticket, Brevo automatically dispatches background transactional email alerts to **all verified administrators** registered in the system.
- **Super Admin Protection Lock**: Root administrator (User ID #1) is permanently locked against demotion or deletion by any other admin.
- **Zero-Flicker Studio Dark Mode**: A custom VS Code / Linear-inspired dark palette (`#0d1117` / `#161b22`) powered by CSS Master Design Tokens with instant 1-click switcher and `localStorage` persistence.
- **Self-Service Account & Profile Management**: Real-time profile editing (Name, Flat/Unit No) and authenticated credential changes with verification status indicators.

---

## 🏗️ System Architecture

```text
                                  HTTPS
        ┌────────────────────────────────────────────────────────┐
        │            React 19 Frontend (Vite + React Router)     │
        │          Hosted on Vercel Edge Global Network          │
        └───────────────────────────┬────────────────────────────┘
                                    │
                                    │ JSON REST API (Axios + Bearer JWT)
                                    ▼
        ┌────────────────────────────────────────────────────────┐
        │              FastAPI Backend Application               │
        │           Hosted on Render (Python 3.12 ASGI)          │
        └───────────┬───────────────┬──────────────────┬─────────┘
                    │               │                  │
                    │               │                  └──────────▶ Brevo (Sendinblue) API
                    │               │                               - Email Verification
                    │               │                               - Multi-Admin Notification
                    │               │                               - Status Resolution Alerts
                    │               │                               - Password Recovery
                    │               │
                    │               └─────────────────────────────▶ Cloudinary CDN
                    │                                               - Photographic Proof Storage
                    ▼
        ┌────────────────────────────────────────────────────────┐
        │          PostgreSQL Database (Supabase Pooler)         │
        │       Users, Complaints, Status History, Notices       │
        └────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features & Role Workflows

### 1. Resident Experience
- **Frictionless Onboarding**: Sign up with Full Name, Flat/Unit Number, Email, and Password with instant background email verification.
- **Ticket Submission**: Select from preset maintenance categories (*Plumbing, Electrical, Cleanliness, Elevator, Security, Other*), provide descriptive notes, and attach photo evidence.
- **Real-Time Timeline**: View detailed audit timeline steppers displaying administrative notes, status changes, and image lightboxes.
- **Official Notice Board**: Instant access to pinned high-priority alerts and society circulars with client-side live search.
- **Account Settings (`/profile`)**: Manage personal identification details and update security passwords directly.

### 2. Society Operations & Admin Console
- **Unified Operations Table**: View all resident tickets with inline status mutations (`Open`, `In Progress`, `Resolved`), priority toggles (`High`, `Medium`, `Low`), and SLA breach indicators.
- **Dynamic Sorting Options**:
  - *Priority (High → Low)* [Default]
  - *Date Raised (Oldest First / FIFO)*
  - *Date Raised (Newest First)*
  - *Flat / Room No*
  - *Ticket ID (#)*
- **Administrative Notes**: Add resolution notes during status transitions, which are permanently logged and emailed to residents.
- **Soft-Archival & Restoration**: Archive resolved complaints to keep the active queue clean without losing audit compliance data.

### 3. Super Admin Security & Committee Management
- **Managing Committee Tab**: Audit all registered residents and committee admins.
- **Promote / Demote Roles**: Promote active residents to Society Admins or demote existing admins with confirmation safeguards.
- **Super Admin Hardcoded Immunity**: User ID #1 (`aamijetomar@gmail.com`) is permanently protected from demotion by any admin.

### 4. Design System & Studio Dark Mode
- **Refined Color Palette**:
  - Light Theme: Crisp clean slate with soft neutral borders.
  - Dark Theme: Deep comfortable charcoal (`#0d1117` background, `#161b22` cards, `#f0f6fc` high-contrast typography).
- **Universal Token Architecture**: 100% tokenized CSS variables with zero hardcoded inline styles.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19, Vite, React Router v7 | Fast Single-Page Application (SPA) with responsive layout |
| **Styling** | Custom Tokenized CSS3 | Design-token variables, zero CSS bloat, Studio Dark Mode |
| **Backend** | FastAPI (Python 3.12), Pydantic v2 | High-performance asynchronous REST API framework |
| **ORM & DB** | SQLAlchemy, PostgreSQL (Supabase) | Relational modeling, connection pooling, foreign-key integrity |
| **Security** | Passlib (Bcrypt), PyJWT | Password hashing, signed 1-hour reset tokens, Bearer auth |
| **Media CDN** | Cloudinary Python SDK | Cloud image upload and optimized asset delivery |
| **Email Service** | Brevo (Sendinblue API v3) | Non-blocking transactional email delivery via FastAPI BackgroundTasks |
| **Hosting** | Vercel (Client), Render (Server) | Global Edge CDN & managed Python hosting |

---

## 📁 Repository Structure

```text
society-tracker/
├── backend/
│   ├── main.py                   # FastAPI entrypoint, CORS configuration, router mounting
│   ├── database.py               # SQLAlchemy database engine and session factory
│   ├── models.py                 # Declarative models (User, Complaint, StatusHistory, Notice)
│   ├── schemas.py                # Pydantic validation schemas (In/Out/Update)
│   ├── auth.py                   # Bcrypt password hashing, JWT generation & verification
│   ├── routers/
│   │   ├── auth_routes.py        # Auth, verification, profile, RBAC & password reset
│   │   ├── complaints.py         # Ticket CRUD, status transitions, priority & archive
│   │   ├── notices.py            # Society notice board circulars & pinned alerts
│   │   └── analytics.py          # KPI metrics, overdue calculations & category breakdown
│   └── utils/
│       ├── email_utils.py        # Brevo transactional email templates & background sender
│       └── cloudinary_utils.py   # Cloudinary image upload utility
├── frontend/
│   ├── index.html                # HTML5 root with metadata
│   ├── src/
│   │   ├── main.jsx              # React DOM mounting & initial theme bootstrapping
│   │   ├── App.jsx               # Route definitions and protected navigation
│   │   ├── api.js                # Axios instance, Bearer interceptors & 401 error handler
│   │   ├── index.css             # Master CSS Design Tokens (Light/Dark themes)
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Sticky navigation with theme toggle & role badge
│   │   │   └── Navbar.css        # Navbar styling & theme switcher styles
│   │   └── pages/
│   │       ├── Login.jsx / .css          # Resident & Admin authentication
│   │       ├── Register.jsx / .css       # New resident account registration
│   │       ├── VerifyEmail.jsx / .css    # Email verification confirmation page
│   │       ├── ForgotPassword.jsx / .css # Password recovery request initiator
│   │       ├── ResetPassword.jsx / .css  # Signed token password reset view
│   │       ├── Dashboard.jsx / .css      # Resident ticket dashboard & metrics
│   │       ├── RaiseComplaint.jsx / .css # Grievance filing form with photo upload
│   │       ├── ComplaintDetail.jsx / .css# Stepper timeline audit trail & photo zoom
│   │       ├── AdminDashboard.jsx / .css # Executive command center & committee tab
│   │       ├── Notices.jsx / .css        # Society circulars & admin publishing form
│   │       └── Profile.jsx / .css        # Account settings & password change page
│   └── package.json              # Frontend scripts and dependencies
├── Readme.md                     # Platform technical documentation
└── requirements.txt              # Python production dependencies
```

---

## 💻 Local Development Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **PostgreSQL database instance** (Local or Supabase)
- **Cloudinary** and **Brevo (Sendinblue)** API accounts

---

### 1. Backend Setup

1. **Navigate to the backend directory and create a virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activate virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r ../requirements.txt
   ```

4. **Create `.env` file in `backend/.env`**:
   ```ini
   DATABASE_URL=postgresql://user:password@host:port/dbname
   SECRET_KEY=your_super_secret_jwt_key_here
   BREVO_API_KEY=xkeysib-your-brevo-api-key
   BREVO_SENDER_EMAIL=your_verified_sender@domain.com
   BREVO_SENDER_NAME=FixMyMohalla
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start backend development server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Swagger API Documentation will be accessible at: `http://localhost:8000/docs`*

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install npm dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file in `frontend/.env`**:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start Vite development server**:
   ```bash
   npm run dev
   ```
   *Frontend application will be accessible at: `http://localhost:5173`*

---

## 🔐 Environment Configuration Reference

| Variable Name | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://postgres:pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` |
| `SECRET_KEY` | **Yes** | Cryptographic secret for signing JWTs | `b3f12a64c8d7e9...` |
| `BREVO_API_KEY` | **Yes** | Brevo v3 Transactional API Key | `xkeysib-39f28a...` |
| `BREVO_SENDER_EMAIL`| **Yes** | Verified sender email in Brevo | `notifications@fixmymohalla.in` |
| `BREVO_SENDER_NAME` | **No** | Display name for outgoing emails | `FixMyMohalla Society Desk` |
| `CLOUDINARY_CLOUD_NAME`| **Yes** | Cloudinary Cloud Name | `dmxy...` |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API Key | `48291829...` |
| `CLOUDINARY_API_SECRET`| **Yes** | Cloudinary API Secret | `Kx9f2L...` |
| `FRONTEND_URL` | **Yes** | Origin URL for email action links | `https://fix-my-mohalla.vercel.app` |

---

## 📡 REST API Specification

### 1. Authentication, Profile & RBAC
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new resident account & trigger email verification |
| `POST` | `/auth/login` | Public | Authenticate credentials and return JWT Bearer token |
| `GET` | `/auth/verify-email/{token}` | Public | Verify resident account from email confirmation link |
| `POST` | `/auth/forgot-password` | Public | Dispatch 1-hour signed password recovery token via email |
| `POST` | `/auth/reset-password` | Public | Submit new password using signed reset token |
| `GET` | `/auth/me` | Authenticated | Retrieve currently authenticated user profile |
| `PATCH` | `/auth/me` | Authenticated | Update user display name and flat/unit number |
| `POST` | `/auth/change-password` | Authenticated | Update account password using current password verification |
| `GET` | `/auth/users` | Admin | List all registered society members with role designations |
| `PATCH` | `/auth/users/{user_id}/role` | Admin | Promote/demote member role (Locked for Super Admin #1) |

### 2. Complaints Operations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/complaints/my` | Resident | List all complaints raised by authenticated resident |
| `POST` | `/complaints/` | Resident | Raise new maintenance complaint with photo attachment |
| `GET` | `/complaints/{id}` | Authenticated | Get detailed complaint metadata, status timeline & photo |
| `GET` | `/complaints` | Admin | List all society complaints with filtering & archived flag |
| `PATCH` | `/complaints/{id}/status` | Admin | Update ticket status (`Open`, `In Progress`, `Resolved`) with remark |
| `PATCH` | `/complaints/{id}/priority`| Admin | Mutate priority tier (`Low`, `Medium`, `High`) |
| `DELETE`| `/complaints/{id}` | Admin | Soft-archive a resolved ticket |
| `PATCH` | `/complaints/{id}/restore` | Admin | Restore an archived ticket back to active queue |

### 3. Notice Board
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notices/` | Authenticated | Retrieve all official notices (Pinned notices returned first) |
| `POST` | `/notices/` | Admin | Publish new society circular with optional high-priority flag |
| `DELETE`| `/notices/{id}` | Admin | Delete an official society notice circular |

### 4. Metrics & Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/analytics/summary` | Admin | Fetch operational metrics: total, resolved, pending, overdue SLA |

---

## 🗄️ Database Schema & Security Architecture

```mermaid
erDiagram
    USERS ||--o{ COMPLAINTS : "raises"
    USERS ||--o{ NOTICES : "publishes"
    COMPLAINTS ||--o{ STATUS_HISTORY : "tracks"

    USERS {
        int id PK
        string name
        string email UK
        string hashed_password
        string flat_no
        string role "resident | admin"
        boolean is_verified
        string verification_token
        datetime created_at
    }

    COMPLAINTS {
        int id PK
        int resident_id FK
        string category
        string description
        string photo_url
        string current_status "Open | In Progress | Resolved"
        string priority "Low | Medium | High"
        boolean is_archived
        datetime created_at
        datetime updated_at
        datetime resolved_at
    }

    STATUS_HISTORY {
        int id PK
        int complaint_id FK
        string status
        string note
        int changed_by FK
        datetime changed_at
    }

    NOTICES {
        int id PK
        string title
        string body
        boolean is_important
        int created_by FK
        datetime created_at
    }
```

---

## 🌐 Production Deployment Guide

### Backend Deployment (Render)
1. Link GitHub repository to Render Web Service.
2. Configure runtime parameters:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Add all required backend environment variables in the Render Dashboard.

### Frontend Deployment (Vercel)
1. Import GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Configure Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com`
4. Deploy. Vercel will automatically compile and distribute the SPA across its Edge network.

---

## 👨‍💻 Author

**Tushar Kumar**  
*B.Tech in Computer Science & Engineering (Final Year)*  
**Vellore Institute of Technology (VIT), Chennai**  

- **Instagram**: [@kum_tushar_1407](https://www.instagram.com/kum_tushar_1407/)
- **LinkedIn**: [linkedin.com/in/tushar-kumar](https://www.linkedin.com/in/tushar-kumar-bb3ab128a/)
- **GitHub**: [github.com/tushar1121s](https://github.com/tushar1121s)
- **Email**: `tusharkumarjuly14@gmail.com`

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for full details.
