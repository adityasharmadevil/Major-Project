# DIDS Backend - Spring Boot API

Backend API for the Distributed Intrusion Detection System (DIDS) built with Spring Boot.

## Technology Stack

- **Spring Boot 3.2.0** - Framework
- **MongoDB** - Database
- **Spring Security** - Authentication & Authorization
- **JWT** - Token-based authentication
- **Maven** - Build tool
- **Java 17** - Programming language

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB (running on localhost:27017)

## Setup Instructions

1. **Install MongoDB**
   ```bash
   # macOS (using Homebrew)
   brew install mongodb-community
   brew services start mongodb-community
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

2. **Configure Application**
   - Update `src/main/resources/application.properties` or `application.yml`
   - Change JWT secret key for production
   - Update MongoDB connection if needed

3. **Build and Run**
   ```bash
   # Build the project
   mvn clean install
   
   # Run the application
   mvn spring-boot:run
   ```

   The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Devices (Protected)
- `GET /api/devices` - Get all devices
- `GET /api/devices/{id}` - Get device by ID
- `PATCH /api/devices/{id}/status` - Update device status

### Alerts (Protected)
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/{id}` - Get alert by ID
- `PATCH /api/alerts/{id}/read` - Mark alert as read
- `PATCH /api/alerts/{id}/resolved` - Mark alert as resolved
- `GET /api/alerts/stats` - Get alert statistics

### Logs (Protected)
- `GET /api/logs` - Get all logs
- `GET /api/logs/device/{deviceId}` - Get logs by device

### Policies (Protected)
- `GET /api/policies` - Get all policies
- `GET /api/policies/{id}` - Get policy by ID
- `POST /api/policies` - Create policy
- `PUT /api/policies/{id}` - Update policy
- `DELETE /api/policies/{id}` - Delete policy
- `POST /api/policies/{id}/deploy` - Deploy policy to devices

### Dashboard (Protected)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-alerts` - Get recent alerts
- `GET /api/dashboard/device-status` - Get device status

## Database Schema

### Users Collection
```json
{
  "id": "string",
  "username": "string",
  "password": "string (hashed)",
  "name": "string",
  "email": "string",
  "role": "string"
}
```

### Devices Collection
```json
{
  "id": "string",
  "name": "string",
  "ipAddress": "string",
  "os": "string",
  "status": "online|offline",
  "lastSeen": "datetime",
  "alertCount": "number"
}
```

### Alerts Collection
```json
{
  "id": "string",
  "deviceId": "string",
  "deviceName": "string",
  "type": "string",
  "description": "string",
  "severity": "critical|high|medium|low",
  "status": "open|resolved",
  "timestamp": "datetime"
}
```

### Logs Collection
```json
{
  "id": "string",
  "deviceId": "string",
  "deviceName": "string",
  "event": "string",
  "message": "string",
  "level": "error|warning|info",
  "timestamp": "datetime"
}
```

### Policies Collection
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "rules": {
    "blockUnauthorizedApps": "boolean",
    "blockUSB": "boolean",
    "requireAntivirus": "boolean",
    "blockInternetAccess": "boolean",
    "monitorFileChanges": "boolean"
  },
  "active": "boolean",
  "deployedDevices": ["string"]
}
```

## Default Admin User

To create a default admin user, you can use MongoDB:

```javascript
// Connect to MongoDB
use dids

// Create admin user (password: admin)
db.users.insertOne({
  username: "admin",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // bcrypt hash of "admin"
  name: "Admin",
  email: "admin@dids.local",
  role: "Administrator"
})
```

Or create a data initialization script in Spring Boot.

## Security

- JWT-based authentication
- Password encryption using BCrypt
- CORS configured for frontend (localhost:3000)
- Protected endpoints require valid JWT token

## Development

- Hot reload enabled with Spring Boot DevTools
- Debug logging enabled for `com.dids` package
- API documentation can be added with Swagger/OpenAPI

## Production Considerations

1. Change JWT secret to a strong random string
2. Use environment variables for sensitive configuration
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up proper logging
6. Use connection pooling for MongoDB
7. Add rate limiting
8. Implement proper error handling

