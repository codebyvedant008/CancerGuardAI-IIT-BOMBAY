# CancerGuard AI — Clinical Risk Assessment Platform

CancerGuard AI is a secure, modern, production-ready, AI-assisted cancer risk screening and clinical assessment platform. It supports modular AI prediction workflows for **Skin Cancer**, **Brain Tumor**, **Lung Cancer**, and **Breast Cancer** scans, and generates clinical-grade PDF reports with strict medical disclaimers.

> [!IMPORTANT]
> **Strict Medical Disclaimer:** This AI system provides risk assessment only and is not a substitute for professional medical diagnosis. All output assessments are experimental screening guides and must be verified by a qualified physician.

---

## 🚀 Key Features

1. **Secure Authentication:** JWT-based user and admin sessions, encrypted passwords, session checks.
2. **AI Screening Modules:**
   - **Skin Cancer:** Dermoscopic lesion analysis.
   - **Brain Tumor:** MRI scan evaluation.
   - **Lung Cancer:** Chest X-ray analysis.
   - **Breast Cancer:** Digital Mammogram assessment.
3. **Interactive Dashboards:**
   - **Patient Dashboard:** Metrics, history, and custom SVG risk distributions.
   - **Admin Portal:** Platforms stats, category breakdowns, user registries, and audit logs.
4. **Clinical PDF Reports:** Generated on-demand using ReportLab, branded, signed, and complete with patient demographics, risk levels, and medical disclaimers.
5. **Docker Integration:** Easy multi-container orchestration.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS, Lucide icons)
* **Backend:** FastAPI (Python, Uvicorn, Pydantic, SQLAlchemy)
* **Database:** PostgreSQL (with automatic SQLite fallback for testing)
* **Reporting:** ReportLab (clinical-grade PDF builder)
* **Containerization:** Docker & Docker Compose

---

## 📂 Project Structure

```
CancerGuardAI/
├── backend/
│   ├── app/
│   │   ├── models/        # Database models (User, Scan, Prediction, Report)
│   │   ├── routes/        # Router endpoints (auth, predict, scans, reports, admin)
│   │   ├── services/      # AI models & PDF Report generator services
│   │   ├── utils/         # Helper functions (security, db initialization)
│   │   ├── config.py      # App configurations
│   │   └── main.py        # Application entrypoint
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/           # App routes (dashboard, login, register, upload, result)
│   │   ├── components/    # Layouts and reusable widgets
│   │   ├── context/       # Auth state provider
│   │   └── services/      # API wrappers
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## 🐳 Docker Deployment (Recommended)

To spin up the entire application, including the database, backend, and frontend containers:

```bash
docker-compose up --build
```

Access the interfaces:
* **Frontend Dashboard:** `http://localhost:3000`
* **FastAPI Backend Swagger Specs:** `http://localhost:8000/docs`

### 🔑 Default Credentials
On database startup, a default administrator account is seeded:
* **Email:** `admin@cancerguard.ai`
* **Password:** `adminpassword123`

---

## ⚙️ Local Development Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy/configure environment variables in `.env` (a template is auto-generated on launch).
5. Start Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Boot the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

---

## 🔒 Data Privacy & Access Control
All patient scans are encrypted and strictly isolated. General users can only view their own uploaded logs. Only designated system administrators (`is_admin=True`) have access to compile aggregate statistics and view clinical logs across the entire user base.
