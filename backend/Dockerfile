FROM python:3.12-slim

WORKDIR /app

# Install necessary build tools for psycopg2 / encryption
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY . .

# Create required directories
RUN mkdir -p uploads reports

# Expose FastAPI port
EXPOSE 8000

# Run Uvicorn server in production mode (no --reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
