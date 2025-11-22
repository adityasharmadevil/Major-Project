# PolicyShieldMonitor

A production-ready Distributed Intrusion Detection System (DIDS) for monitoring network-wide security compliance and policy violations.

## 🏗️ Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Spring Boot 3.2.0 with MongoDB
- **Database**: MongoDB Atlas
- **Authentication**: JWT-based security
- **Real-time**: WebSocket for terminal connections

## 📁 Project Structure

```
Major Project/
├── backend/              # Spring Boot API
│   ├── src/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── PRODUCTION_DEPLOYMENT.md
├── my-app/              # React Frontend
│   ├── src/
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 16+
- Maven 3.6+
- MongoDB Atlas account

### Development Setup

1. **Backend:**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

2. **Frontend:**
   ```bash
   cd my-app
   npm install
   npm start
   ```

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Health Check: http://localhost:8080/actuator/health

## 🔒 Production Deployment

See [PRODUCTION_DEPLOYMENT.md](backend/PRODUCTION_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Production Checklist

- [ ] Set strong JWT secret (min 32 characters)
- [ ] Configure MongoDB Atlas with production credentials
- [ ] Set CORS allowed origins to production domain
- [ ] Enable production profile: `SPRING_PROFILES_ACTIVE=prod`
- [ ] Set up SSL/HTTPS
- [ ] Configure monitoring and alerts
- [ ] Set up database backups
- [ ] Review security settings

### Environment Variables

Required for production:
```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DATABASE=policyShieldMonitor
JWT_SECRET=<strong-secret-min-32-chars>
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SPRING_PROFILES_ACTIVE=prod
```

## 🐳 Docker Deployment

```bash
# Build and run
cd backend
docker-compose up -d

# View logs
docker logs -f policyshieldmonitor-backend
```

## 📊 Features

- ✅ Real-time device monitoring
- ✅ Security alert management
- ✅ Policy violation detection
- ✅ Web-based terminal access
- ✅ Comprehensive logging
- ✅ Health monitoring endpoints
- ✅ Production-ready security

## 🔐 Security

- JWT-based authentication
- BCrypt password hashing
- CORS configuration
- Input validation
- Global error handling
- Security headers
- Environment-based secrets

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login

### Devices
- `GET /api/devices` - List all devices
- `POST /api/devices` - Create device
- `GET /api/devices/{id}` - Get device details

### Alerts
- `GET /api/alerts` - List alerts
- `PATCH /api/alerts/{id}/resolved` - Resolve alert

### Monitoring
- `GET /actuator/health` - Health check
- `GET /actuator/info` - Application info
- `GET /actuator/metrics` - Application metrics

## 🛠️ Development

### Running Tests
```bash
cd backend
mvn test
```

### Building for Production
```bash
cd backend
mvn clean package -DskipTests
```

## 📚 Documentation

- [Backend README](backend/README.md)
- [Frontend README](my-app/README.md)
- [Production Deployment Guide](backend/PRODUCTION_DEPLOYMENT.md)
- [Terminal Setup](backend/TERMINAL_SETUP.md)
- [MongoDB Troubleshooting](backend/MONGODB_TROUBLESHOOTING.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of an academic Major Project.

## 🆘 Support

For issues or questions:
- Check the troubleshooting guides
- Review application logs
- Check health endpoints: `/actuator/health`

---

**Status**: Production Ready ✅
