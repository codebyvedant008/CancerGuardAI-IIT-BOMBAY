FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy frontend source files
COPY . .

# Set dynamic configuration environment variables
ENV NEXT_PUBLIC_API_URL=http://localhost:8000/api
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
