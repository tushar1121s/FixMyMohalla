<div align="center">

# FixMyMohalla

**Enterprise-Grade Society Maintenance & Grievance Redressal Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5.svg?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Brevo](https://img.shields.io/badge/Email-Brevo%20Transactional-0B99FF.svg?style=flat-square&logo=sendinblue&logoColor=white)](https://brevo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

*A full-stack, auditable workflow system replacing unstructured chat groups and paper registers with role-based ticket management, photo proof verification, real-time status progression, and automated transactional email alerts.*

</div>

---

## 📑 Table of Contents

- [Platform Overview](#platform-overview)
- [System Architecture](#system-architecture)
- [Key Features & Role Workflows](#key-features--role-workflows)
  - [Resident Workflow](#resident-workflow)
  - [Administration Workflow](#administration-workflow)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [REST API Specification](#rest-api-specification)
  - [Authentication & Recovery](#1-authentication--recovery)
  - [Complaints Management](#2-complaints-management)
  - [Notice Board](#3-notice-board)
  - [Analytics & Metrics](#4-analytics--metrics)
- [Database Schema & Security Architecture](#database-schema--security-architecture)
- [Production Deployment Guide](#production-deployment-guide)
  - [Backend Deployment (Render)](#backend-deployment-render)
  - [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Author](#author)
- [License](#license)

---

## Platform Overview

Residential communities often struggle with maintenance tracking due to fragmented communication across instant messaging apps and handwritten security logs. Critical issues get buried, responsibility remains ambiguous, and historical maintenance logs are lost.

**FixMyMohalla** provides a centralized, transparent platform engineered to enforce accountability:

- **Immutable Audit Trails**: Every status transition (`Open` → `In Progress` → `Resolved`), priority change, and administrative remark is permanently logged with timestamps and user identifiers.
- **Automated Lifecycle Notifications**: Integrated with Brevo Transactional Email to deliver real-time notifications for account verification, ticket creation, status changes, and secure password recovery.
- **Overdue Resolution Engine**: Time-based SLA tracking flags complaints exceeding the resolution threshold, automatically prioritizing them on administrative dashboards.
- **Controlled Archival Workflow**: Resolved complaints are locked against arbitrary modifications and can be safely archived/restored by administrators without data loss.

---

## System Architecture

```text
                                HTTPS
       ┌─────────────────────────────────────────────────────┐
       │             React 19 Frontend (Vite)                │
       │           Hosted on Vercel Edge Network             │
       └──────────────────────────┬──────────────────────────┘
                                  │
                                  │ JSON REST APIs (Axios + JWT)
                                  ▼
       ┌─────────────────────────────────────────────────────┐
       │             FastAPI Backend Service                 │
       │               Hosted on Render                      │
       └──────────┬───────────────┬─────────────────┬────────┘
                  │               │                 │
                  │               │                 └──────────▶ Brevo SMTP / API
                  │               │                              - Email Verification
                  │               │                              - Complaint Updates
                  │               │                              - Password Recovery
                  │               │
                  │               └────────────────────────────▶ Cloudinary CDN
                  │                                              - Photo Attachments
                  ▼
       ┌─────────────────────────────────────────────────────┐
       │       PostgreSQL Database (Supabase Pooler)         │
       │    Users, Complaints, Audit History, Notices        │
       └─────────────────────────────────────────────────────┘
```

---

## Key Features & Role Workflows

### Resident Workflow
1. **Onboarding & Verification**: Resident registers with name, flat number, email, and password. An asynchronous email verification token is dispatched via Brevo.
2. **Complaint Registration**: Resident selects a category (Plumbing, Electrical, Cleanliness, Elevator, Security, or Custom), enters detailed descriptions, and optionally uploads photographic proof.
3. **Tracking & Audit Trail**: Real-time access to personal complaint history, complete with status stepper timeline and full-resolution image lightbox.
4. **Notice Board Access**: Instant search and read access to official society circulars, with priority announcements pinned at the top.
5. **Account Recovery**: Self-service password reset flow powered by signed, time-limited JWT tokens.

### Administration Workflow
1. **Command Dashboard**: High-level KPI summary displaying total active tickets, overdue escalations, and resolution counts.
2. **Multi-Criteria Triage**: Filter tickets across categories, resolution statuses, and active vs. archived states.
3. **Inline Mutations**: Dynamic status transitions with optional resolution notes delivered to the resident's inbox.
4. **Overdue SLA Management**: Automatic visual indicators and sorting for tickets exceeding the configurable `OVERDUE_DAYS` limit.
5. **Archival & Purge Control**: Soft-delete functionality allowing resolved tickets to be archived and restored on demand.
6. **Circular Broadcasting**: Create and publish society notices with optional high-priority pinned ribbons.

---

## Technology Stack

| Layer | Component | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, Vite 6 | Single Page Application with optimized bundle splitting |
| **Routing** | React Router DOM v7 | Client-side declarative routing and protected routes |
| **Network Client** | Axios | HTTP client with request/response JWT interceptors |
| **Styling Architecture** | Modular Scoped CSS | Component-isolated CSS with design tokens (zero heavy UI dependencies) |
| **Backend Core** | FastAPI (Python 3.11) | High-performance asynchronous REST API framework |
| **ORM & Database** | SQLAlchemy 2.0, PostgreSQL | Relational modeling with connection pooling via Supabase |
| **Validation** | Pydantic v2 | Type safety, request payload validation, and response serialization |
| **Authentication** | `python-jose`, `passlib[bcrypt]` | Stateless JWT authentication with salted password hashing |
| **Media Pipeline** | Cloudinary SDK | Cloud storage, transformation, and CDN distribution for images |
| **Email Service** | `sib-api-v3-sdk` (Brevo) | Transactional email dispatch executed via `BackgroundTasks` |
| **Infrastructure** | Vercel & Render | Cloud hosting with automated continuous deployment |

---

## Repository Structure

```text
FixMyMohalla/
├── backend/
│   ├── routers/
│   │   ├── auth_routes.py        # /auth (register, verify, login, forgot/reset password)
│   │   ├── complaints.py         # /complaints (CRUD, status/priority, archive/restore)
│   │   ├── dashboard.py          # /dashboard (analytics, metrics, aggregate counts)
│   │   └── notices.py            # /notices (bulletin board circulars)
│   ├── utils/
│   │   ├── cloudinary_upload.py  # Image upload and CDN helper
│   │   └── email_utils.py        # Brevo transactional email templates and dispatcher
│   ├── auth.py                   # JWT generation, token verification, and route guards
│   ├── config.py                 # Environment variables and application settings
│   ├── database.py               # Database engine, session maker, and Base model
│   ├── models.py                 # SQLAlchemy relational ORM models
│   ├── schemas.py                # Pydantic schemas for payload validation
│   ├── main.py                   # FastAPI initialization, CORS, and router bindings
│   └── requirements.txt          # Python runtime dependencies
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Role-aware sticky header component
    │   │   └── Navbar.css        # Navbar styles
    │   ├── pages/
    │   │   ├── Login.jsx         # Authentication view with recovery access
    │   │   ├── Login.css
    │   │   ├── Register.jsx      # Resident signup form
    │   │   ├── Register.css
    │   │   ├── VerifyEmail.jsx   # Email token verification screen
    │   │   ├── VerifyEmail.css
    │   │   ├── ForgotPassword.jsx# Password recovery initiation screen
    │   │   ├── ForgotPassword.css
    │   │   ├── ResetPassword.jsx # Secure password update screen
    │   │   ├── ResetPassword.css
    │   │   ├── Dashboard.jsx     # Resident ticket feed and personal metrics
    │   │   ├── Dashboard.css
    │   │   ├── RaiseComplaint.jsx# Ticket creation with image preview
    │   │   ├── RaiseComplaint.css
    │   │   ├── ComplaintDetail.jsx# Full ticket metadata, zoom lightbox, audit stepper
    │   │   ├── ComplaintDetail.css
    │   │   ├── AdminDashboard.jsx# Multi-filter management console with inline actions
    │   │   ├── AdminDashboard.css
    │   │   ├── Notices.jsx       # Real-time circular board with search filter
    │   │   └── Notices.css
    │   ├── api.js                # Axios instance with 401 interceptor & JWT injection
    │   ├── App.jsx               # Client application routing configuration
    │   ├── main.jsx              # DOM entry point
    │   └── index.css             # Global CSS design tokens, reset, and variables
    ├── package.json
    └── vite.config.js
```

---

## Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 or higher
- **Database**: Active PostgreSQL database (e.g., Supabase instance)
- **Cloudinary**: Active cloud credentials
- **Brevo**: Active API key and verified sender address

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell/CMD):
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory with the following configuration:

```env
# Database
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-region.pooler.supabase.com:6543/postgres

# Security & JWT
JWT_SECRET=your_super_secret_random_key_here
JWT_ALGORITHM=HS256
OVERDUE_DAYS=7

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Brevo (Sendinblue) Email Service
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
MAIL_FROM=your_verified_brevo_sender@domain.com
MAIL_FROM_NAME=FixMyMohalla
NOTIFY_ADMIN_EMAIL=admin@domain.com

# Dynamic Frontend URL for Email Links
FRONTEND_URL=http://localhost:5173
```

Start the backend development server:

```bash
uvicorn main:app --reload --port 8000
```
- **API Server Running**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install
```

Create a `.env` file in the `frontend/` directory (optional for local testing):

```env
VITE_API_URL=http://localhost:8000
```

Start the Vite development server:

```bash
npm run dev
```
- **Application URL**: `http://localhost:5173`

---

## REST API Specification

### 1. Authentication & Recovery

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new resident account and trigger verification email |
| `GET` | `/auth/verify/{token}` | Public | Verify resident email via one-time signed token |
| `POST` | `/auth/login` | Public | Authenticate user and return JWT bearer token & role |
| `POST` | `/auth/forgot-password` | Public | Trigger password reset link to user's registered email |
| `POST` | `/auth/reset-password` | Public | Update user password using validated recovery token |

### 2. Complaints Management

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/complaints/` | Resident | Create complaint with multipart form data & optional image |
| `GET` | `/complaints/my` | Resident | Retrieve all complaints submitted by the authenticated resident |
| `GET` | `/complaints/` | Admin | Query all society complaints with filtering and archival options |
| `GET` | `/complaints/{id}` | Authenticated | Retrieve complete ticket details and full history timeline |
| `PATCH`| `/complaints/{id}/status` | Admin | Update complaint status (`Open`, `In Progress`, `Resolved`) |
| `PATCH`| `/complaints/{id}/priority` | Admin | Update priority tier (`Low`, `Medium`, `High`) |
| `DELETE`| `/complaints/{id}` | Admin | Soft-delete / archive a resolved complaint |
| `PATCH`| `/complaints/{id}/restore` | Admin | Restore an archived complaint back to active records |

### 3. Notice Board

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notices/` | Authenticated | Fetch society circulars ordered by priority and date |
| `POST` | `/notices/` | Admin | Publish a new society announcement with optional priority pin |

### 4. Analytics & Metrics

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Admin | Aggregate counts by status, category breakdown, and overdue metrics |

---

## Database Schema & Security Architecture

```mermaid
erDiagram
    USERS ||--o{ COMPLAINTS : "submits"
    USERS ||--o{ NOTICES : "publishes"
    USERS ||--o{ COMPLAINT_HISTORY : "modifies"
    COMPLAINTS ||--o{ COMPLAINT_HISTORY : "tracks"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string flat_no
        string role
        boolean is_verified
        datetime created_at
    }

    COMPLAINTS {
        int id PK
        int resident_id FK
        string category
        string description
        string photo_url
        string current_status
        string priority
        boolean is_archived
        datetime created_at
        datetime resolved_at
    }

    COMPLAINT_HISTORY {
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
        int posted_by FK
        datetime created_at
    }
```

### Security Highlights
- **Stateless Authorization**: All protected endpoints require a valid `Bearer <JWT_TOKEN>` header.
- **Role Isolation**: Dependency injection via `get_current_user` and `require_admin` guards sensitive administration operations.
- **Automated Revocation**: The frontend Axios response interceptor captures `401 Unauthorized` responses to clear local storage credentials and redirect users to `/login`.
- **SQL Injection Defense**: All database queries are constructed using SQLAlchemy ORM parameterized statements.

---

## Production Deployment Guide

### Backend Deployment (Render)
1. Link your GitHub repository to a new **Web Service** on [Render](https://render.com).
2. Configure settings:
   - **Environment**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `DATABASE_URL`: *Your Supabase PostgreSQL Connection String*
   - `JWT_SECRET`: *Your Secure Secret Key*
   - `JWT_ALGORITHM`: `HS256`
   - `OVERDUE_DAYS`: `7`
   - `CLOUDINARY_CLOUD_NAME`: *Cloudinary Cloud Name*
   - `CLOUDINARY_API_KEY`: *Cloudinary API Key*
   - `CLOUDINARY_API_SECRET`: *Cloudinary API Secret*
   - `BREVO_API_KEY`: *Brevo API Key*
   - `MAIL_FROM`: *Verified Brevo Sender Email*
   - `MAIL_FROM_NAME`: `FixMyMohalla`
   - `NOTIFY_ADMIN_EMAIL`: *Admin Notification Email*
   - `FRONTEND_URL`: `https://your-app.vercel.app`

### Frontend Deployment (Vercel)
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com`

---

## Troubleshooting & FAQ

#### 1. Why are verification or password reset emails not arriving?
- Check your spam, promotions, or junk folders.
- Ensure `MAIL_FROM` in `.env` matches a verified sender identity configured in your [Brevo Senders Dashboard](https://app.brevo.com).
- Verify that your Brevo API key begins with `xkeysib-` and has active sending quotas.

#### 2. Why does logging in as Admin in one tab change my Resident session in another?
- Modern web browsers share `localStorage` across tabs of the same origin. To test both roles simultaneously on the same machine, open the Admin portal in a normal browser window and the Resident portal in an **Incognito / Private Window** (`Ctrl + Shift + N`).

#### 3. How do I make a resident user an administrator?
- Connect to your Supabase SQL editor and execute:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
  ```

---

## Author

**Tushar Kumar**  
B.Tech (Final Year), Vellore Institute of Technology (VIT), Chennai  
- GitHub: [@tushar1121s](https://github.com/tushar1121s)  
- Repository: [FixMyMohalla](https://github.com/tushar1121s/FixMyMohalla)

---

## License

This project is distributed under the terms of the [MIT License](LICENSE).
