# CancerGuard AI 🏥

<div align="center">

![CancerGuard AI Banner](https://img.shields.io/badge/CancerGuard-AI%20Risk%20Screening-teal?style=for-the-badge&logo=activity)

**AI-Powered Cancer Risk Assessment Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)](https://sqlite.org/)

> ⚠️ **Medical Disclaimer:** CancerGuard AI provides AI-assisted risk assessment only. It is **not a substitute for professional medical diagnosis**. All outputs must be verified by a qualified healthcare provider.

</div>

---

## 📋 Overview

**CancerGuard AI** is a full-stack, production-ready cancer risk screening and clinical assessment platform built for the **IIT Bombay** project submission. It leverages modular AI prediction pipelines to analyse uploaded medical scans and produce clinical-grade PDF reports across **16 cancer types**.

The system is designed to assist clinicians and patients by providing rapid, secure, and reproducible AI-powered risk indicators — helping bridge the gap between radiology imaging and early oncology detection.

---

## ✨ Features

### 🔬 AI Screening Modules (16 Cancer Types)
| Module | Imaging Modality |
|---|---|
| Skin Cancer | Dermoscopic Images |
| Brain Tumor | MRI Scans |
| Lung Cancer | Chest X-Rays |
| Breast Cancer | Mammograms |
| Prostate Cancer | Ultrasound / MRI |
| Colorectal Cancer | Colonoscopy Images |
| Ovarian Cancer | Ultrasound |
| Thyroid Cancer | Ultrasound |
| Pancreatic Cancer | CT / MRI |
| Liver Cancer | CT Scans |
| Leukemia | Blood Smear Images |
| Lymphoma | PET / CT Scans |
| Cervical Cancer | Pap Smear Images |
| Esophageal Cancer | Endoscopy Images |
| Stomach Cancer | Endoscopy Images |
| Melanoma | Dermoscopic Images |

### 🔐 Secure Authentication
- JWT-based session management
- Bcrypt password hashing
- Role-based access control (Patient / Admin)

### 📊 Interactive Dashboards
- **Patient Dashboard** — scan history, risk trends, metrics
- **Admin Portal** — platform analytics, user registry, audit logs

### 📄 Clinical PDF Reports
- Professional, doctor-friendly layout using ReportLab Platypus
- Patient demographics grid with mock Scan IDs and Patient IDs
- Color-coded risk classifications (Low / Medium / High)
- AI Probability Score, recommendations, physician notes & signature block
- Mandatory medical disclaimer

### 🔔 Notification System
- In-app notifications for scan results and system events

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, TypeScript, Vanilla CSS |
| **Backend** | FastAPI, Python 3.11+ |
| **Database** | SQLite (via SQLAlchemy ORM) |
| **AI Pipeline** | Modular rule-based + model-ready architecture |
| **PDF Generation** | ReportLab Platypus |
| **Authentication** | JWT (python-jose), Bcrypt (passlib) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.11+
- **pip** and **venv**

---

### 1. Clone the Repository

```bash
git clone https://github.com/codebyvedant008/CancerGuardAI-IIT-BOMBAY.git
cd CancerGuardAI-IIT-BOMBAY
```

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will be live at: **http://localhost:8000**
Swagger docs: **http://localhost:8000/api/docs**

---

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be live at: **http://localhost:3000**

---

### 4. Default Admin Credentials

```
Email:    admin@cancerguard.ai
Password: adminpassword123
```

---

## 📁 Project Structure

```
CancerGuardAI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── database/            # SQLAlchemy connection & session
│   │   ├── models/              # ORM models (User, Scan, Prediction, Report)
│   │   ├── routes/              # API route handlers
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── predict_enhanced.py  # AI prediction (16 cancer types)
│   │   │   ├── scans.py         # Scan management
│   │   │   ├── reports.py       # PDF report generation
│   │   │   ├── admin.py         # Admin portal APIs
│   │   │   └── notifications.py # Notification system
│   │   ├── services/
│   │   │   ├── ai_service.py    # Core AI prediction logic
│   │   │   ├── pdf_service.py   # Clinical PDF generation
│   │   │   └── notification_service.py
│   │   └── utils/
│   │       ├── security.py      # JWT & password hashing
│   │       └── dependencies.py  # FastAPI dependencies
│   ├── requirements.txt
│   └── reports/                 # Generated PDF reports
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── dashboard/       # Patient dashboard
│   │   │   ├── upload/          # Scan upload & result
│   │   │   ├── history/         # Scan history
│   │   │   ├── admin/           # Admin portal
│   │   │   ├── login/           # Authentication
│   │   │   └── register/        # Registration
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Global auth state
│   │   └── services/
│   │       └── api.ts           # API client
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and get JWT token |
| `GET` | `/api/auth/me` | Get current user profile |
| `POST` | `/api/predict/{cancer_type}` | Submit scan for AI prediction |
| `GET` | `/api/scans/history` | Get user scan history |
| `GET` | `/api/reports/download/{prediction_id}` | Download PDF report |
| `GET` | `/api/admin/analytics` | Admin platform statistics |
| `GET` | `/api/admin/users` | Admin user registry |

Full interactive API documentation: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## 📸 Screenshots

### Landing Page
> Modern, responsive hero section with live risk monitor preview.

### Patient Dashboard
> Real-time scan statistics, history, and risk distribution charts.

### Upload & Result
> Multi-step scan upload with immediate AI risk assessment output.

### Clinical PDF Report
> Professional, doctor-friendly report with patient demographics, AI findings, and physician signature block.

---

## 🛡️ Security

- All passwords are hashed using **bcrypt** — never stored in plain text
- JWT tokens expire after a configurable time period
- CORS policy restricts requests to trusted origins only
- Medical scan files are stored securely with access control tied to user accounts

---

## ⚠️ Medical Disclaimer

> **IMPORTANT:** CancerGuard AI is an AI-assisted risk screening tool intended to **support**, not replace, the clinical judgment of a qualified medical professional. All predictions generated are probabilistic indicators based on reference patterns and are for informational purposes only. Always consult a licensed oncologist or physician before making any medical decisions.

---

## 👨‍💻 Author

**Vedant** — [codebyvedant008](https://github.com/codebyvedant008)

Project developed for **IIT Bombay** submission.

---

## 📄 License

This project is submitted for academic purposes under the IIT Bombay project guidelines.

---

<div align="center">
  <strong>Built with ❤️ for better cancer screening accessibility</strong>
</div>
