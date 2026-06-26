import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.models.user import User, Admin, DoctorProfile, PatientDoctorLink
from app.models.scan import ClinicalReview
from app.utils.security import get_password_hash
from app.routes import auth, scans, reports, admin, notifications, chat, doctor, integration
from app.routes import predict_enhanced as predict  # Use enhanced predict routes with 15+ cancer types

# Create database tables (SQLAlchemy base metadata create)
Base.metadata.create_all(bind=engine)

# Seed default admin user if not exists
def seed_admin_user():
    db = SessionLocal()
    try:
        # Check if default admin exists in Users (marked with is_admin=True)
        admin_email = "admin@cancerguard.ai"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            hashed_pw = get_password_hash("adminpassword123")
            new_admin = User(
                email=admin_email,
                hashed_password=hashed_pw,
                full_name="System Admin",
                age=35,
                gender="other",
                is_active=True,
                is_admin=True
            )
            db.add(new_admin)
            
            # Also create corresponding entry in Admins table
            new_admin_table_entry = Admin(
                email=admin_email,
                hashed_password=hashed_pw,
                full_name="System Admin"
            )
            db.add(new_admin_table_entry)
            
            db.commit()
            print("[OK] Default admin user created: admin@cancerguard.ai / adminpassword123")
    except Exception as e:
        print(f"Error seeding admin user: {e}")
    finally:
        db.close()

seed_admin_user()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="🚀 AI-assisted Cancer Risk Assessment Platform - Supporting 15+ Cancer Types with Advanced Analytics",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration
# Reads FRONTEND_URL from environment for production deployments (e.g. Vercel)
# Falls back to localhost for local development
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
    "http://localhost:3001",
    "https://localhost:3001",
]

# Add production frontend URL if configured
if FRONTEND_URL:
    origins.append(FRONTEND_URL)
    # Also allow with/without trailing slash
    origins.append(FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(predict.router, prefix=settings.API_V1_STR)
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(doctor.router, prefix=settings.API_V1_STR)
app.include_router(integration.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "message": "Welcome to the CancerGuard AI Platform APIs. Visit /docs for interactive documentation."
    }
