# Deployment Guide

## Production Deployment

### Server Requirements
- Linux/macOS server
- Node.js 18+ runtime
- 2GB+ RAM recommended
- SSL certificate for HTTPS

### Environment Setup

1. Create production environment file:
   ```bash
   cp .env.example .env.production
   ```

2. Configure production settings:
   ```env
   NODE_ENV=production
   MCP_PORT=443
   SSL_CERT_PATH=/etc/ssl/certs/cert.pem
   SSL_KEY_PATH=/etc/ssl/private/key.pem
   ```

### Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start with process manager**:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Configure reverse proxy** (nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
       }
   }
   ```

## Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring

- Set up health checks
- Monitor server logs
- Configure alerts for downtime
- Track MCP connection metrics