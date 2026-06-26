import os

class Settings:
    PROJECT_NAME: str = "CancerGuard AI"
    API_V1_STR: str = "/api"
    # IMPORTANT: Set a strong random SECRET_KEY in production via environment variable!
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforcancerguardaiplatform2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database — use DATABASE_URL env var in production (e.g. Neon, Supabase PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cancerguard.db")
    
    # Frontend URL — set to your Vercel production URL in Render environment variables
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    REPORTS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)

