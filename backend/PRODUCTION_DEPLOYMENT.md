# Production Deployment Guide

This guide covers deploying PolicyShieldMonitor to production.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB Atlas account (or MongoDB instance)
- Docker (optional, for containerized deployment)
- Domain name and SSL certificate (for HTTPS)

## Pre-Deployment Checklist

### 1. Security Configuration

- [ ] Generate a strong JWT secret (minimum 32 characters):
  ```bash
  openssl rand -base64 32
  ```
- [ ] Update MongoDB connection string with production credentials
- [ ] Configure CORS with actual frontend domain(s)
- [ ] Remove or disable development-only features
- [ ] Review and update security headers

### 2. Environment Variables

Create a `.env` file (never commit this to version control):

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=policyShieldMonitor
JWT_SECRET=<generated-strong-secret>
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGINS=https://yourdomain.com
PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

### 3. MongoDB Atlas Configuration

- [ ] Create production database user with appropriate permissions
- [ ] Configure IP whitelist (add your server IP or use 0.0.0.0/0 for development)
- [ ] Enable MongoDB Atlas monitoring and alerts
- [ ] Set up database backups
- [ ] Configure connection pooling settings

### 4. Build Application

```bash
# Clean and build
mvn clean package -DskipTests

# Verify JAR is created
ls -lh target/*.jar
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Build Docker image:**
   ```bash
   docker build -t policyshieldmonitor-backend:latest .
   ```

2. **Run with docker-compose:**
   ```bash
   # Create .env file first
   docker-compose up -d
   ```

3. **Or run directly:**
   ```bash
   docker run -d \
     --name policyshieldmonitor-backend \
     -p 8080:8080 \
     --env-file .env \
     policyshieldmonitor-backend:latest
   ```

### Option 2: Traditional Deployment

1. **Copy JAR to server:**
   ```bash
   scp target/policyshieldmonitor-backend-1.0.0.jar user@server:/opt/policyshieldmonitor/
   ```

2. **Create systemd service** (`/etc/systemd/system/policyshieldmonitor.service`):
   ```ini
   [Unit]
   Description=PolicyShieldMonitor Backend
   After=network.target

   [Service]
   Type=simple
   User=policyshieldmonitor
   WorkingDirectory=/opt/policyshieldmonitor
   Environment="SPRING_PROFILES_ACTIVE=prod"
   EnvironmentFile=/opt/policyshieldmonitor/.env
   ExecStart=/usr/bin/java -jar /opt/policyshieldmonitor/policyshieldmonitor-backend-1.0.0.jar
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. **Start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable policyshieldmonitor
   sudo systemctl start policyshieldmonitor
   sudo systemctl status policyshieldmonitor
   ```

### Option 3: Cloud Platform Deployment

#### Heroku
```bash
heroku create policyshieldmonitor-backend
heroku config:set SPRING_PROFILES_ACTIVE=prod
heroku config:set MONGODB_URI=<your-uri>
heroku config:set JWT_SECRET=<your-secret>
heroku config:set CORS_ALLOWED_ORIGINS=<your-origins>
git push heroku main
```

#### AWS Elastic Beanstalk
1. Create application in Elastic Beanstalk
2. Configure environment variables
3. Deploy JAR file

#### Google Cloud Run
```bash
gcloud run deploy policyshieldmonitor-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod
```

## Post-Deployment

### 1. Verify Health

```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Check application info
curl http://localhost:8080/actuator/info
```

### 2. Monitor Logs

```bash
# Docker
docker logs -f policyshieldmonitor-backend

# Systemd
journalctl -u policyshieldmonitor -f
```

### 3. Set Up Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. SSL/HTTPS Configuration

Use Let's Encrypt with Certbot:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

### 5. Monitoring and Alerts

- Set up application monitoring (e.g., New Relic, Datadog)
- Configure log aggregation (e.g., ELK Stack, CloudWatch)
- Set up alerts for:
  - Application downtime
  - High error rates
  - Database connection issues
  - High memory/CPU usage

## Performance Optimization

1. **JVM Tuning:**
   ```bash
   java -Xms512m -Xmx1024m -XX:+UseG1GC -jar app.jar
   ```

2. **Connection Pooling:**
   - MongoDB connection pool settings in `application-prod.properties`
   - Monitor connection pool metrics

3. **Caching:**
   - Consider adding Redis for session/cache management
   - Implement response caching where appropriate

## Security Best Practices

1. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

2. **Access Control:**
   - Use least privilege principle
   - Rotate credentials regularly
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault)

3. **Network Security:**
   - Use firewall rules
   - Enable DDoS protection
   - Implement rate limiting

4. **Monitoring:**
   - Monitor failed login attempts
   - Set up intrusion detection
   - Regular security audits

## Backup and Recovery

1. **Database Backups:**
   - Configure MongoDB Atlas automated backups
   - Test restore procedures regularly

2. **Application Backups:**
   - Version control for code
   - Document configuration changes
   - Maintain deployment runbooks

## Troubleshooting

### Application won't start
- Check environment variables
- Verify MongoDB connectivity
- Review application logs
- Check port availability

### High memory usage
- Adjust JVM heap size
- Review connection pool settings
- Check for memory leaks

### Database connection issues
- Verify MongoDB Atlas IP whitelist
- Check connection string
- Review network connectivity

## Support

For issues or questions:
- Check logs: `docker logs policyshieldmonitor-backend`
- Review application metrics: `/actuator/metrics`
- Check health status: `/actuator/health`

