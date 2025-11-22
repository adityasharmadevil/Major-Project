# Distributed Intrusion Detection System (DIDS) - Frontend

A modern React-based web dashboard for monitoring and managing network-wide intrusion detection across multiple endpoints.

## Features

- 🔐 **Authentication** - Secure login system with JWT token management
- 📊 **Real-time Dashboard** - Live monitoring of devices, alerts, and system status
- 💻 **Device Management** - View and manage all network endpoints
- 🚨 **Alerts System** - Monitor security violations and policy breaches
- 📝 **Activity Logs** - Comprehensive event logging and audit trail
- ⚙️ **Policy Management** - Create, edit, and deploy security policies

## Technology Stack

- **React 19** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Icons** - Icon library
- **xterm.js** - Web-based terminal emulator
- **SockJS & STOMP** - WebSocket communication for real-time terminal

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (or copy from `.env.example`):
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=http://localhost:8080/ws
```

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Sidebar, Header)
│   └── ProtectedRoute.js
├── context/            # React Context providers
│   └── AuthContext.js  # Authentication state management
├── pages/              # Page components
│   ├── Login.js
│   ├── Dashboard.js
│   ├── Devices.js
│   ├── Alerts.js
│   ├── Logs.js
│   └── Policies.js
├── services/           # API services
│   └── api.js          # Axios configuration and API endpoints
├── App.js              # Main app component with routing
└── index.js            # Entry point
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)

## API Integration

The frontend is configured to communicate with a backend API. Update the `REACT_APP_API_URL` in your `.env` file to point to your backend server.

### API Endpoints Expected

- `POST /api/auth/login` - User authentication
- `GET /api/devices` - Get all devices
- `GET /api/alerts` - Get alerts
- `GET /api/logs` - Get logs
- `GET /api/policies` - Get policies
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/devices` - Create new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `PATCH /api/alerts/:id/resolved` - Mark alert as resolved
- WebSocket: `/ws` - Terminal connection endpoint

See `src/services/api.js` for the complete API service layer.

## Features Overview

### Dashboard
- Real-time statistics (devices, alerts, resolved issues)
- Recent alerts feed
- Quick navigation to other sections

### Devices
- List all network endpoints
- Device status (online/offline)
- Search and filter capabilities
- Device details and alert counts
- Add new devices via modal form
- Connect to devices via web-based terminal (SSH-like interface)

### Alerts
- View all security violations
- Filter by status (open/resolved)
- Mark alerts as resolved (persisted in localStorage)
- Severity-based color coding
- Real-time alert count updates across pages

### Logs
- Comprehensive event logging
- Filter by device
- Search functionality
- Timestamp tracking

### Policies
- Create and manage security policies
- Configure security rules
- Deploy policies to devices
- Policy status tracking

## Development Notes

- The app uses mock data when the backend is not available
- Authentication tokens are stored in localStorage
- Protected routes require authentication
- Real-time terminal connection via WebSocket (STOMP over SockJS)
- Resolved alerts are persisted in localStorage for development
- Automatic fallback to local command handling if WebSocket connection fails
- Password show/hide toggle on login form
- Cross-component state synchronization via localStorage events

## Backend Integration

This frontend is designed to work with a Spring Boot or Node.js backend. Ensure your backend implements the expected API endpoints and follows the same authentication flow (JWT tokens).

## License

This project is part of a Major Project for academic purposes.
