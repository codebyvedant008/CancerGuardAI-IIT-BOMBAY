"""
Unit tests for CancerGuard AI Backend - Authentication and User Management
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database.connection import Base, get_db
from app.models.user import User
from app.utils.security import get_password_hash, verify_password

# Test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

class TestAuthentication:
    """Test authentication endpoints."""
    
    def test_register_new_user(self):
        """Test user registration with valid data."""
        response = client.post(
            "/api/v1/register",
            json={
                "email": "testuser@example.com",
                "password": "testpass123",
                "full_name": "Test User",
                "age": 30,
                "gender": "other"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "testuser@example.com"
        assert "access_token" in data

    def test_register_duplicate_email(self):
        """Test registration fails with duplicate email."""
        # First registration
        client.post(
            "/api/v1/register",
            json={
                "email": "duplicate@example.com",
                "password": "pass123",
                "full_name": "User 1",
                "age": 25,
                "gender": "other"
            }
        )
        
        # Second registration with same email
        response = client.post(
            "/api/v1/register",
            json={
                "email": "duplicate@example.com",
                "password": "pass456",
                "full_name": "User 2",
                "age": 35,
                "gender": "other"
            }
        )
        assert response.status_code == 400

    def test_login_valid_credentials(self):
        """Test login with valid credentials."""
        # Register first
        client.post(
            "/api/v1/register",
            json={
                "email": "login@example.com",
                "password": "password123",
                "full_name": "Login Test",
                "age": 28,
                "gender": "other"
            }
        )
        
        # Login
        response = client.post(
            "/api/v1/login",
            json={
                "email": "login@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_login_invalid_password(self):
        """Test login fails with wrong password."""
        # Register first
        client.post(
            "/api/v1/register",
            json={
                "email": "wrongpass@example.com",
                "password": "correctpass",
                "full_name": "Test",
                "age": 30,
                "gender": "other"
            }
        )
        
        # Try login with wrong password
        response = client.post(
            "/api/v1/login",
            json={
                "email": "wrongpass@example.com",
                "password": "wrongpass"
            }
        )
        assert response.status_code == 401

    def test_verify_password_hashing(self):
        """Test password hashing and verification."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert password != hashed
        assert verify_password(password, hashed)
        assert not verify_password("wrongpassword", hashed)

class TestPredictionEndpoints:
    """Test cancer prediction endpoints."""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for tests."""
        response = client.post(
            "/api/v1/register",
            json={
                "email": "pred@example.com",
                "password": "pass123",
                "full_name": "Prediction Test",
                "age": 30,
                "gender": "other"
            }
        )
        return response.json()["access_token"]

    def test_get_cancer_types(self, auth_token):
        """Test fetching supported cancer types."""
        response = client.get(
            "/api/v1/predict/cancer-types",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "cancer_types" in data
        assert "total" in data
        assert len(data["cancer_types"]) > 0

    def test_cancer_types_have_metadata(self, auth_token):
        """Test cancer types include required metadata."""
        response = client.get(
            "/api/v1/predict/cancer-types",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        data = response.json()
        for cancer_type in data["cancer_types"]:
            assert "code" in cancer_type
            assert "name" in cancer_type
            assert "description" in cancer_type
            assert "imaging" in cancer_type
            assert "specificity" in cancer_type

class TestScanHistory:
    """Test scan history and statistics."""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for tests."""
        response = client.post(
            "/api/v1/register",
            json={
                "email": "hist@example.com",
                "password": "pass123",
                "full_name": "History Test",
                "age": 30,
                "gender": "other"
            }
        )
        return response.json()["access_token"]

    def test_get_prediction_history(self, auth_token):
        """Test fetching prediction history."""
        response = client.get(
            "/api/v1/predict/history",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "history" in data

    def test_get_prediction_stats(self, auth_token):
        """Test fetching prediction statistics."""
        response = client.get(
            "/api/v1/predict/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_scans" in data
        assert "cancer_type_counts" in data
        assert "risk_distribution" in data
        assert "average_confidence" in data

class TestNotifications:
    """Test notification endpoints."""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for tests."""
        response = client.post(
            "/api/v1/register",
            json={
                "email": "notif@example.com",
                "password": "pass123",
                "full_name": "Notification Test",
                "age": 30,
                "gender": "other"
            }
        )
        return response.json()["access_token"]

    def test_get_notifications(self, auth_token):
        """Test fetching notifications."""
        response = client.get(
            "/api/v1/notifications",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "unread_count" in data
        assert "notifications" in data

    def test_get_unread_count(self, auth_token):
        """Test getting unread notification count."""
        response = client.get(
            "/api/v1/notifications/unread-count",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "unread_count" in data

class TestSecurityAndValidation:
    """Test security and input validation."""
    
    def test_register_invalid_email(self):
        """Test registration fails with invalid email."""
        response = client.post(
            "/api/v1/register",
            json={
                "email": "invalidemail",
                "password": "pass123",
                "full_name": "Test",
                "age": 30,
                "gender": "other"
            }
        )
        assert response.status_code == 422

    def test_register_weak_password(self):
        """Test registration with weak password."""
        response = client.post(
            "/api/v1/register",
            json={
                "email": "weak@example.com",
                "password": "123",  # Too short
                "full_name": "Test",
                "age": 30,
                "gender": "other"
            }
        )
        # Depending on validation, this should fail
        assert response.status_code in [400, 422]

    def test_missing_required_fields(self):
        """Test registration with missing required fields."""
        response = client.post(
            "/api/v1/register",
            json={
                "email": "test@example.com"
                # Missing password, name, age, gender
            }
        )
        assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
