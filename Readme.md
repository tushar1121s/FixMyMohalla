# FixMyMohalla
### Society Maintenance Tracker

`React` `FastAPI` `PostgreSQL` `Supabase` `JWT` `Cloudinary` `Render` `Vercel`

FixMyMohalla is a full-stack web application that digitizes society/apartment complaint management — replacing WhatsApp groups and paper registers with a real authenticated system where residents raise complaints with photo evidence, and admins track, prioritize, and resolve them with full accountability.

---

## Table of Contents

- [The Concept](#the-concept)
- [How It Works](#how-it-works)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Data Defaults](#data-defaults)
- [Important Notes](#important-notes)
- [Future Roadmap](#future-roadmap)
- [Author](#author)
- [License](#license)

---

## The Concept

Most residential societies track maintenance complaints informally — a WhatsApp message that gets buried, a register that only the watchman can read, no record of who fixed what or when. FixMyMohalla replaces that with a proper system:

- Every resident has a **real, authenticated account** (bcrypt-hashed password, JWT session) — no shared logins, no dummy data.
- Every complaint is **timestamped, categorized, and photo-backed**, with a full status history so nothing gets lost or forgotten.
- Every admin action is **logged** — status changes, priority changes, and resolution times are tracked, so overdue complaints can't quietly disappear.
- Once a complaint is marked **Resolved, it locks** — preventing silent edits after the fact.

The result is a transparent audit trail between residents and the society management committee.

---

## How It Works

**1. Register / Login (Resident)**

A resident signs up with name, email, password, and flat number. Passwords are hashed with bcrypt; login issues a JWT used for all subsequent requests.

**2. Raise a Complaint**

The resident submits a category, description, and an optional photo. The photo is uploaded to Cloudinary, and the complaint is stored with `status = Open` and `priority = Low` by default.

**3. Track Status**

The resident can open any complaint to see its full history — every status/priority change is logged in a `ComplaintHistory` timeline.

**4. Admin Review**

Admins see all complaints in a dedicated dashboard, filterable by category, status, and date range, with overdue complaints automatically flagged and sorted to the top.

**5. Resolve**

Admins update status and priority inline. Once a complaint is set to `Resolved`, the backend blocks any further edits to it.

**6. Notices**

Admins can post society-wide notices (e.g. water shutdowns, meeting schedules); important notices are pinned to the top for all residents.

---

## System Architecture

```text
┌─────────────┐        HTTPS        ┌──────────────┐
│   Frontend   │ ───────────────────▶│   Backend    │
│  (Vercel)    │◀─────────────────── │  (Render)    │
└─────────────┘                     └──────┬───────┘
                                           │
                          ┌────────────────┼────────────────┐
                          ▼                                 ▼
               ┌──────────────────┐             ┌───────────────────┐
               │ Supabase Postgres │             │     Cloudinary     │
               │ (users, complaints,│            │  (complaint photos) │
               │  history, notices) │             └───────────────────┘
               └──────────────────┘
````

* **Frontend** is deployed on Vercel (React + Vite) and communicates with the backend over HTTPS.
* **Backend** (FastAPI) is deployed on Render, handling auth, complaint CRUD, admin actions, notices, and dashboard stats.
* **Database** is a managed PostgreSQL instance on Supabase (Session Pooler), storing users, complaints, complaint history, and notices.
* **File storage** for complaint photos is handled by Cloudinary — no binary files are stored on the app server.

---

## Features

### For Residents

* Real authenticated register/login (bcrypt + JWT, no dummy data)
* Raise complaints with category, description, and optional photo
* View complaint status and full history timeline
* Click-to-zoom lightbox on complaint photos
* View society notices (important ones pinned first)

### For Admins

* Dedicated admin dashboard with filters: category, status, date range
* Automatic overdue detection — overdue complaints sorted first
* Inline status & priority updates (dropdown-based)
* Resolved complaints auto-lock from further edits
* Post and manage society-wide notices
* Stats dashboard — complaints by status, by category, overdue count

### Platform

* Global 401 handling — invalid/expired tokens auto-logout and redirect to login
* Route protection audited across every page, for both roles
* Custom design-token CSS system (no framework) rolled out across all pages

---

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Frontend         | React (Vite), React Router, Axios               |
| Frontend Hosting | Vercel                                          |
| Backend          | Python, FastAPI, SQLAlchemy, Pydantic           |
| Backend Hosting  | Render                                          |
| Auth             | JWT (python-jose) + bcrypt (passlib)            |
| Database         | PostgreSQL (Supabase, Session Pooler)           |
| File Storage     | Cloudinary                                      |
| Styling          | Custom CSS variables + reusable utility classes |

---

## Project Structure

```text
FixMyMohalla/
│
├── backend/
│   ├── main.py                   # FastAPI app, CORS, router registration
│   ├── database.py               # SQLAlchemy engine & session (Supabase)
│   ├── config.py                 # Env var loading
│   ├── models.py                 # User, Complaint, ComplaintHistory, Notice
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── auth.py                   # HTTPBearer auth, hashing, guards
│   ├── routers/
│   │   ├── auth_routes.py        # /auth/register, /auth/login
│   │   ├── complaints.py         # Complaint CRUD + admin routes
│   │   ├── notices.py            # Notice board routes
│   │   └── dashboard.py          # Admin stats
│   ├── utils/
│   │   └── cloudinary_upload.py  # Photo upload helper
│   ├── requirements.txt
│   └── .env                      # DB, JWT, Cloudinary, Mail creds (gitignored)
│
└── frontend/
    ├── src/
    │   ├── api.js                # Axios instance + JWT & 401 interceptors
    │   ├── App.jsx               # Routes + Navbar
    │   ├── index.css             # Design tokens & shared classes
    │   ├── components/
    │   │   └── Navbar.jsx
    │   └── pages/
    │       ├── Register.jsx
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── RaiseComplaint.jsx
    │       ├── ComplaintDetail.jsx
    │       ├── AdminDashboard.jsx
    │       └── Notices.jsx
    ├── .env                      # VITE_API_URL (gitignored)
    └── package.json
```

---

## Installation & Setup

### Prerequisites

* Node.js v18+
* Python 3.10+
* A Supabase project (Postgres connection string)
* A Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/FixMyMohalla.git
cd FixMyMohalla
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=<your Supabase Postgres connection string>
JWT_SECRET_KEY=<your secret key>
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
```

Start the server:

```bash
uvicorn main:app --reload
```

Runs at: `http://localhost:8000` — Swagger docs at `http://localhost:8000/docs`

> **Note:** Swagger uses `HTTPBearer`. Paste only the raw JWT token into the Authorize box — do **not** prefix it with `Bearer `.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

Runs at: `http://localhost:5173`

### 4. Production Deployment

* **Backend** → Deploy to Render (root: `backend`, build: `pip install -r requirements.txt`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT`). Set `DATABASE_URL`, `JWT_SECRET_KEY`, `CLOUDINARY_*` as environment variables in the Render dashboard.
* **Frontend** → Deploy to Vercel. Set `VITE_API_URL` to the live Render URL.
* **CORS** → Ensure the deployed frontend origin is added to `allow_origins` in `main.py` alongside `http://localhost:5173` for local dev.

---

## API Endpoints

### Auth

| Method | Endpoint         | Description               |
| ------ | ---------------- | ------------------------- |
| POST   | `/auth/register` | Register a new resident   |
| POST   | `/auth/login`    | Login, returns JWT + role |

### Complaints

| Method | Endpoint                    | Description                                                                   |
| ------ | --------------------------- | ----------------------------------------------------------------------------- |
| POST   | `/complaints/`              | Raise a complaint (multipart: category, description, optional photo)          |
| GET    | `/complaints/my`            | Get logged-in user's complaints                                               |
| GET    | `/complaints/{id}`          | Get complaint details + history                                               |
| GET    | `/complaints`               | *(Admin)* List all complaints — filters: category, status, date_from, date_to |
| PATCH  | `/complaints/{id}/status`   | *(Admin)* Update status — body: `{status, note}`                              |
| PATCH  | `/complaints/{id}/priority` | *(Admin)* Update priority — body: `{priority}`                                |

### Notices

| Method | Endpoint    | Description                            |
| ------ | ----------- | -------------------------------------- |
| POST   | `/notices/` | *(Admin)* Post a notice                |
| GET    | `/notices/` | Get all notices (important ones first) |

### Dashboard

| Method | Endpoint      | Description                                             |
| ------ | ------------- | ------------------------------------------------------- |
| GET    | `/dashboard/` | *(Admin)* Stats — by_status, by_category, overdue_count |

---

## Data Defaults

| Field            | Default | Possible Values             |
| ---------------- | ------- | --------------------------- |
| `current_status` | `Open`  | Open, In Progress, Resolved |
| `priority`       | `Low`   | Low, Medium, High           |

---

## Important Notes

* Once a complaint's status is set to `Resolved`, the backend blocks any further status/priority edits to it.
* Admin access is currently granted **manually** via the Supabase table editor (`role = 'admin'`) — there is no self-service admin signup yet.
* `.env` files are gitignored on both frontend and backend; no secrets are committed to the repository.
* Email notifications (Gmail SMTP via `fastapi-mail`) are installed and configured in `config.py` but not yet wired into the complaint flow.

---

## Future Roadmap

**Backend**

* Email notifications on complaint status changes (Gmail SMTP via fastapi-mail)
* Automatic admin assignment (secret code at registration, or first-user-is-admin logic)

**Authentication**

* Google OAuth login ("Sign in with Google")
* Forgot password flow (reset token + email link)

**Documentation**

* Full README + system design write-up
* Final submission/zip prep

---

## Author

*Tushar kumar - B.tech(VIT CHENNAI)*

---

## License

This project is currently unlicensed / private. Add a license here if you plan to open-source it.

```
```
