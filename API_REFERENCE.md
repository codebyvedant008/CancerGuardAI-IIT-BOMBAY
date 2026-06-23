# 🔌 CancerGuard AI - Complete API Reference

## Base URL
```
Production: https://api.cancerguard.ai/api/v1
Development: http://localhost:8000/api/v1
```

---

## 🔐 Authentication

All endpoints (except `/register` and `/login`) require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### **Register New User**
```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "age": 35,
  "gender": "male"
}

Response: 200 OK
{
  "id": "uuid-here",
  "email": "user@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### **Login**
```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

### **Get Current User**
```http
GET /me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid-here",
  "email": "user@example.com",
  "full_name": "John Doe",
  "age": 35,
  "gender": "male",
  "is_active": true,
  "created_at": "2024-06-15T10:30:00Z"
}
```

---

## 🔬 **Cancer Type Endpoints**

### **Get All Supported Cancer Types**
```http
GET /predict/cancer-types
Authorization: Bearer <token>

Response: 200 OK
{
  "total": 16,
  "cancer_types": [
    {
      "code": "skin",
      "name": "Skin Cancer",
      "description": "Melanoma and non-melanoma skin cancer detection",
      "imaging": "Dermoscopic images",
      "specificity": 0.92
    },
    {
      "code": "brain",
      "name": "Brain Tumor",
      "description": "Brain tumor detection and classification",
      "imaging": "MRI scans",
      "specificity": 0.88
    },
    // ... more cancer types
  ]
}
```

---

## 🎯 **Prediction Endpoints**

### **Unified Prediction Endpoint**
```http
POST /predict/unified/{cancer_type}
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file> (JPG, JPEG, or PNG)

Response: 200 OK
{
  "scan_id": "scan-uuid-here",
  "prediction_id": "pred-uuid-here",
  "cancer_type": "skin",
  "cancer_name": "Skin Cancer",
  "prediction": "Low Risk",
  "confidence": 92.35,
  "recommendation": "Routine screening recommended in 12 months.",
  "imaging_modality": "Dermoscopic images",
  "image_path": "filename.jpg",
  "created_at": "2024-06-23T14:30:00Z",
  "disclaimer": "This AI system provides risk assessment only..."
}
```

### **Skin Cancer Prediction**
```http
POST /predict/skin
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK (same as unified endpoint)
```

### **Brain Tumor Prediction**
```http
POST /predict/brain
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Lung Cancer Prediction**
```http
POST /predict/lung
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Breast Cancer Prediction**
```http
POST /predict/breast
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Colorectal Cancer Prediction**
```http
POST /predict/colorectal
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Ovarian Cancer Prediction**
```http
POST /predict/ovarian
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Prostate Cancer Prediction**
```http
POST /predict/prostate
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Thyroid Cancer Prediction**
```http
POST /predict/thyroid
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Pancreatic Cancer Prediction**
```http
POST /predict/pancreatic
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Liver Cancer Prediction**
```http
POST /predict/liver
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Leukemia Prediction**
```http
POST /predict/leukemia
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Lymphoma Prediction**
```http
POST /predict/lymphoma
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Cervical Cancer Prediction**
```http
POST /predict/cervical
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Esophageal Cancer Prediction**
```http
POST /predict/esophageal
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Stomach Cancer Prediction**
```http
POST /predict/stomach
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

### **Melanoma Prediction**
```http
POST /predict/melanoma
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>

Response: 200 OK
```

---

## 📊 **Analytics Endpoints**

### **Get Prediction History**
```http
GET /predict/history?cancer_type=skin&limit=50
Authorization: Bearer <token>

Response: 200 OK
{
  "total": 12,
  "history": [
    {
      "scan_id": "scan-uuid",
      "prediction_id": "pred-uuid",
      "cancer_type": "skin",
      "prediction": "Low Risk",
      "confidence": 92.35,
      "created_at": "2024-06-23T14:30:00Z",
      "cancer_info": {
        "name": "Skin Cancer",
        "description": "...",
        "imaging": "Dermoscopic images",
        "specificity": 0.92
      }
    },
    // ... more scans
  ]
}
```

### **Get Prediction Statistics**
```http
GET /predict/stats
Authorization: Bearer <token>

Response: 200 OK
{
  "total_scans": 25,
  "cancer_type_counts": {
    "skin": 8,
    "brain": 5,
    "lung": 7,
    "breast": 5
  },
  "risk_distribution": {
    "Low Risk": 15,
    "Medium Risk": 7,
    "High Risk": 3
  },
  "average_confidence": 91.23
}
```

---

## 🔔 **Notification Endpoints**

### **Get User Notifications**
```http
GET /notifications?unread_only=false&limit=50
Authorization: Bearer <token>

Response: 200 OK
{
  "total": 8,
  "unread_count": 2,
  "notifications": [
    {
      "id": "notif-uuid",
      "title": "✅ Scan Analysis Complete - Skin",
      "message": "Your skin scan has been analyzed. Risk Level: Low Risk",
      "type": "scan_completed",
      "is_read": false,
      "created_at": "2024-06-23T15:45:00Z"
    },
    // ... more notifications
  ]
}
```

### **Mark Notification as Read**
```http
POST /notifications/{notification_id}/read
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Notification marked as read"
}
```

### **Get Unread Notification Count**
```http
GET /notifications/unread-count
Authorization: Bearer <token>

Response: 200 OK
{
  "unread_count": 2
}
```

### **Get Notification Preferences**
```http
GET /notifications/preferences
Authorization: Bearer <token>

Response: 200 OK
{
  "email_notifications": true,
  "high_risk_alerts": true,
  "scan_completed": true,
  "report_generated": true,
  "appointment_reminders": true
}
```

### **Update Notification Preferences**
```http
PUT /notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "email_notifications": true,
  "high_risk_alerts": true,
  "scan_completed": false,
  "report_generated": true,
  "appointment_reminders": false
}

Response: 200 OK
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": { /* ... */ }
}
```

---

## 📄 **Report Endpoints**

### **Get All Reports**
```http
GET /reports?limit=50
Authorization: Bearer <token>

Response: 200 OK
{
  "total": 5,
  "reports": [
    {
      "id": "report-uuid",
      "prediction_id": "pred-uuid",
      "user_id": "user-uuid",
      "pdf_path": "reports/report_uuid.pdf",
      "created_at": "2024-06-23T14:30:00Z"
    },
    // ... more reports
  ]
}
```

### **Get Report Details**
```http
GET /reports/{report_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "report-uuid",
  "prediction_id": "pred-uuid",
  "pdf_path": "reports/report_uuid.pdf",
  "created_at": "2024-06-23T14:30:00Z",
  "download_url": "https://api.cancerguard.ai/download/report_uuid.pdf"
}
```

### **Generate Report**
```http
POST /reports/{scan_id}/generate
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "report_id": "report-uuid",
  "message": "Report generated successfully",
  "download_url": "https://api.cancerguard.ai/download/report_uuid.pdf"
}
```

---

## ⚙️ **Admin Endpoints**

### **Get Platform Statistics**
```http
GET /admin/stats
Authorization: Bearer <token>
(Admin only)

Response: 200 OK
{
  "total_users": 145,
  "total_scans": 1230,
  "total_predictions": 1230,
  "scans_by_cancer_type": {
    "skin": 320,
    "brain": 280,
    "lung": 350,
    "breast": 280
  },
  "risk_distribution": {
    "Low Risk": 800,
    "Medium Risk": 280,
    "High Risk": 150
  }
}
```

### **Get All Users**
```http
GET /admin/users?limit=50&page=1
Authorization: Bearer <token>
(Admin only)

Response: 200 OK
{
  "total": 145,
  "users": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    // ... more users
  ]
}
```

---

## 🚨 **Error Responses**

### **400 Bad Request**
```json
{
  "detail": "Invalid cancer type. Supported types: skin, brain, lung, breast, ..."
}
```

### **401 Unauthorized**
```json
{
  "detail": "Could not validate credentials"
}
```

### **403 Forbidden**
```json
{
  "detail": "Not enough permissions"
}
```

### **404 Not Found**
```json
{
  "detail": "Resource not found"
}
```

### **422 Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error"
    }
  ]
}
```

### **500 Internal Server Error**
```json
{
  "detail": "Internal server error"
}
```

---

## 📌 **Rate Limiting**

API endpoints are rate limited to prevent abuse:

- **Standard Endpoints**: 100 requests per minute
- **Prediction Endpoints**: 20 requests per minute
- **Admin Endpoints**: 50 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1624434000
```

---

## 🔗 **Quick Reference**

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/register` | ❌ | User registration |
| POST | `/login` | ❌ | User login |
| GET | `/me` | ✅ | Get current user |
| GET | `/predict/cancer-types` | ✅ | List cancer types |
| POST | `/predict/{cancer_type}` | ✅ | Analyze image |
| GET | `/predict/history` | ✅ | Get scan history |
| GET | `/predict/stats` | ✅ | Get statistics |
| GET | `/notifications` | ✅ | Get notifications |
| POST | `/notifications/{id}/read` | ✅ | Mark as read |
| GET | `/reports` | ✅ | List reports |
| POST | `/reports/{scan_id}/generate` | ✅ | Generate report |

---

## 📚 **Code Examples**

### **JavaScript/TypeScript**
```typescript
// Register
const response = await fetch('http://localhost:8000/api/v1/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    full_name: 'John Doe',
    age: 30,
    gender: 'male'
  })
});

// Upload image
const formData = new FormData();
formData.append('file', imageFile);
const uploadResponse = await fetch('http://localhost:8000/api/v1/predict/skin', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### **Python**
```python
import requests

# Register
response = requests.post('http://localhost:8000/api/v1/register', json={
    'email': 'user@example.com',
    'password': 'password123',
    'full_name': 'John Doe',
    'age': 30,
    'gender': 'male'
})

# Upload image
with open('scan.jpg', 'rb') as f:
    files = {'file': f}
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post('http://localhost:8000/api/v1/predict/skin',
                            files=files, headers=headers)
```

### **cURL**
```bash
# Register
curl -X POST http://localhost:8000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "age": 30,
    "gender": "male"
  }'

# Upload image
curl -X POST http://localhost:8000/api/v1/predict/skin \
  -H "Authorization: Bearer <token>" \
  -F "file=@scan.jpg"
```

---

**Last Updated**: June 2026
**API Version**: 2.0.0
**Status**: Production Ready ✅
