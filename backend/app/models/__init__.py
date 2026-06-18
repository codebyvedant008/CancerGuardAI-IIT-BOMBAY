from app.database.connection import Base
from app.models.user import User, Admin
from app.models.scan import Scan
from app.models.prediction import Prediction
from app.models.report import Report

__all__ = ["Base", "User", "Admin", "Scan", "Prediction", "Report"]
