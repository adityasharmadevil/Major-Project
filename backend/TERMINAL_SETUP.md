# Terminal Connectivity Setup

## Overview
The backend now supports WebSocket-based terminal connections for remote device access.

## Backend Components

### 1. WebSocket Configuration (`WebSocketConfig.java`)
- Enables STOMP over WebSocket
- Endpoint: `/ws`
- Allowed origins: `http://localhost:3000`

### 2. Terminal Service (`TerminalService.java`)
- Handles terminal connections and command execution
- Supports device connection, command execution, and disconnection
- Executes system commands (can be extended for SSH)

### 3. Terminal Controller (`TerminalController.java`)
- WebSocket message handler
- Receives terminal messages at `/app/terminal`

### 4. Security Configuration
- WebSocket endpoints (`/ws/**`) are permitted without authentication
- Can be secured later with JWT token validation

## Frontend Components

### Terminal Component (`Terminal.js`)
- Connects to backend via WebSocket using SockJS and STOMP
- Falls back to local commands if WebSocket connection fails
- Real-time bidirectional communication

## How It Works

1. **Connection Flow:**
   - Frontend opens WebSocket connection to `http://localhost:8080/ws`
   - Subscribes to `/topic/terminal/{deviceId}`
   - Sends connect message to `/app/terminal`

2. **Command Execution:**
   - User types command in terminal
   - Command sent to `/app/terminal` with type "command"
   - Backend executes command and sends output back
   - Frontend displays output in terminal

3. **Disconnection:**
   - User types "exit" or closes terminal
   - Disconnect message sent to backend
   - WebSocket connection closed

## Testing

1. **Start Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start Frontend:**
   ```bash
   cd my-app
   npm start
   ```

3. **Test Terminal:**
   - Navigate to Devices page
   - Click "Connect" on any device
   - Type commands (help, status, info, ping, exit)
   - Commands are executed on the backend

## Available Commands

- `help` - Show available commands
- `clear` - Clear terminal screen
- `status` - Show device status
- `info` - Show device information
- `ping` - Test device connectivity
- `exit` - Close terminal connection
- Any system command (executed on backend server)

## Future Enhancements

1. **SSH Integration:**
   - Use JSch or Apache MINA SSHD for real SSH connections
   - Connect to actual remote devices

2. **Authentication:**
   - Add JWT token validation for WebSocket connections
   - Secure terminal access

3. **Command Restrictions:**
   - Whitelist allowed commands
   - Prevent dangerous operations

4. **Session Management:**
   - Track active terminal sessions
   - Support multiple concurrent connections

