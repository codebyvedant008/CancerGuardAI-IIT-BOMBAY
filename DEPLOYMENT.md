# 🚀 CancerGuard AI - Deployment Guide

This guide covers deploying CancerGuard AI to production using various platforms.

---

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups in place
- [ ] SSL certificates ready
- [ ] Secrets manager setup
- [ ] Monitoring configured
- [ ] Email service configured
- [ ] DNS records updated
- [ ] Firewall rules configured
- [ ] Load balancer configured (optional)

---

## 🐳 Docker Deployment

### **Option 1: Docker Compose (Single Server)**

```bash
# Clone repository
git clone https://github.com/yourusername/CancerGuardAI.git
cd CancerGuardAI

# Create .env file with production values
cp .env.example .env.production

# Edit .env.production
nano .env.production

# Build and deploy
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### **Option 2: Docker Stack (Swarm)**

```bash
# Initialize Docker Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml cancerguard

# Monitor deployment
docker stack services cancerguard
```

---

## ☁️ Cloud Deployment Options

### **AWS Deployment (ECS + RDS)**

```bash
# 1. Create ECR repositories
aws ecr create-repository --repository-name cancerguard-backend
aws ecr create-repository --repository-name cancerguard-frontend

# 2. Build and push images
docker tag cancerguard-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/cancerguard-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/cancerguard-backend:latest

# 3. Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier cancerguard-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <strong-password>

# 4. Create ECS cluster
aws ecs create-cluster --cluster-name cancerguard-cluster

# 5. Register task definitions
aws ecs register-task-definition --cli-input-json file://backend-task-def.json
aws ecs register-task-definition --cli-input-json file://frontend-task-def.json

# 6. Create services
aws ecs create-service \
  --cluster cancerguard-cluster \
  --service-name backend \
  --task-definition cancerguard-backend:1 \
  --desired-count 2
```

### **Google Cloud Deployment (Cloud Run + Cloud SQL)**

```bash
# 1. Create Cloud SQL instance
gcloud sql instances create cancerguard-db \
  --database-version=POSTGRES_15 \
  --region=us-central1

# 2. Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/cancerguard-backend
gcloud builds submit --tag gcr.io/PROJECT_ID/cancerguard-frontend

# 3. Deploy backend to Cloud Run
gcloud run deploy cancerguard-backend \
  --image gcr.io/PROJECT_ID/cancerguard-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=postgresql://...

# 4. Deploy frontend to Cloud Run
gcloud run deploy cancerguard-frontend \
  --image gcr.io/PROJECT_ID/cancerguard-frontend \
  --platform managed \
  --region us-central1
```

### **Azure Deployment (Container Instances + Database)**

```bash
# 1. Create resource group
az group create --name cancerguard-rg --location eastus

# 2. Create PostgreSQL server
az postgres server create \
  --resource-group cancerguard-rg \
  --name cancerguard-db \
  --location eastus \
  --admin-user dbadmin \
  --admin-password <strong-password>

# 3. Push to Azure Container Registry
az acr build --registry cancerguard \
  --image backend:latest backend/

# 4. Deploy container instances
az container create \
  --resource-group cancerguard-rg \
  --name cancerguard-backend \
  --image cancerguard.azurecr.io/backend:latest \
  --cpu 1 --memory 1.5 \
  --environment-variables DATABASE_URL=postgresql://...
```

---

## 🔧 Environment Configuration

### **.env.production Example**

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/cancerguard
SQLALCHEMY_DATABASE_URL=postgresql://user:password@host:5432/cancerguard

# Security
SECRET_KEY=<generate-strong-secret-key>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=["https://cancerguard.ai", "https://www.cancerguard.ai"]

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=CancerGuard AI
DEBUG=false

# Email Configuration
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
EMAIL_FROM=noreply@cancerguard.ai

# Frontend
NEXT_PUBLIC_API_URL=https://api.cancerguard.ai/api/v1
NEXT_ENV=production

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_DIR=/data/uploads

# Redis (for caching/sessions)
REDIS_URL=redis://redis:6379/0

# Monitoring
SENTRY_DSN=<sentry-dsn>
NEW_RELIC_LICENSE_KEY=<new-relic-key>
```

---

## 🔒 SSL/TLS Configuration

### **Using Let's Encrypt with Nginx**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone \
  -d cancerguard.ai \
  -d api.cancerguard.ai

# Configure Nginx
sudo nano /etc/nginx/sites-available/cancerguard

# Add SSL configuration
server {
    listen 443 ssl http2;
    server_name cancerguard.ai api.cancerguard.ai;

    ssl_certificate /etc/letsencrypt/live/cancerguard.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cancerguard.ai/privkey.pem;

    # Location blocks for routing...
}

# Enable site
sudo ln -s /etc/nginx/sites-available/cancerguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Logging

### **Docker Health Checks**

```yaml
# docker-compose.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### **Logging Configuration**

```python
# backend/app/config.py
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "access": {
            "format": '%(asctime)s - %(client_addr)s - %(request_line)s - %(status_code)s',
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
        },
        "file": {
            "formatter": "default",
            "class": "logging.FileHandler",
            "filename": "/var/log/cancerguard/app.log",
        },
    },
    "loggers": {
        "": {"handlers": ["default", "file"], "level": "INFO"},
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
```

---

## 🔄 Backup & Recovery

### **Database Backup Script**

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/cancerguard"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="cancerguard"

# Create backup
pg_dump -U dbuser -d $DB_NAME > $BACKUP_DIR/db_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$TIMESTAMP.sql.gz s3://cancerguard-backups/

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

### **Restore from Backup**

```bash
# Restore database
gunzip -c /backups/db_20240623_120000.sql.gz | psql -U dbuser -d cancerguard
```

---

## 📈 Auto-Scaling Configuration

### **Kubernetes HPA (Horizontal Pod Autoscaler)**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cancerguard-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cancerguard-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 🧪 Post-Deployment Testing

```bash
# Health check
curl -s https://api.cancerguard.ai/health | jq .

# Test API endpoints
curl -X GET https://api.cancerguard.ai/api/v1/predict/cancer-types \
  -H "Authorization: Bearer <token>"

# Load testing (Apache Bench)
ab -n 1000 -c 10 https://cancerguard.ai/

# SSL test
curl -I https://cancerguard.ai/
```

---

## 🆘 Troubleshooting

### **Database Connection Issues**

```bash
# Test connection
psql -h <host> -U <user> -d <database>

# Check logs
docker logs cancerguard-backend

# Verify environment variables
docker exec cancerguard-backend env | grep DATABASE
```

### **API Unreachable**

```bash
# Check service status
docker ps
docker service ls  # For Swarm

# Check logs
docker logs <container-id>

# Test endpoint
curl -v http://localhost:8000/health
```

### **Memory Issues**

```bash
# Monitor memory usage
docker stats

# Increase memory limit in docker-compose.yml
services:
  backend:
    mem_limit: 2g
    memswap_limit: 2g
```

---

## 📞 Support

For deployment issues, please:
1. Check logs: `docker-compose logs -f`
2. Review [Issues](https://github.com/yourusername/CancerGuardAI/issues)
3. Contact: support@cancerguard.ai

---

**Last Updated**: June 2026
**Version**: 2.0.0
