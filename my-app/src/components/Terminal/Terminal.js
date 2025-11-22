import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Terminal = ({ device, onClose }) => {
  const terminalRef = useRef(null);
  const terminalInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);
  const stompClientRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#aeafad',
        selection: '#3e3e3e',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    terminalInstanceRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Connect to WebSocket
    const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';
    const socket = new SockJS(WS_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        const sessionId = device.id?.toString() || device.name;
        const topic = `/topic/terminal/${sessionId}`;
        
        // Subscribe to terminal messages
        stompClient.subscribe(topic, (message) => {
          const data = message.body;
          terminal.write(data);
        });

        // Send connect message
        stompClient.publish({
          destination: '/app/terminal',
          body: JSON.stringify({
            deviceId: sessionId,
            deviceName: device.name,
            deviceIp: device.ip,
            type: 'connect',
            command: '',
          }),
        });
      },
      onStompError: (frame) => {
        terminal.writeln(`\x1b[1;31mWebSocket Error: ${frame.headers['message']}\x1b[0m`);
        terminal.writeln('Falling back to local terminal mode');
        terminal.write('$ ');
      },
      onWebSocketError: (error) => {
        terminal.writeln(`\x1b[1;31mConnection Error: ${error.message}\x1b[0m`);
        terminal.writeln('Falling back to local terminal mode');
        terminal.write('$ ');
      },
    });

    socketRef.current = socket;
    stompClientRef.current = stompClient;
    stompClient.activate();

    // Local command handler (fallback when WebSocket is not connected)
    const handleLocalCommand = (command) => {
      switch (command.toLowerCase()) {
        case 'help':
          terminal.writeln('Available commands:');
          terminal.writeln('  help     - Show this help message');
          terminal.writeln('  clear    - Clear the terminal');
          terminal.writeln('  status   - Show device status');
          terminal.writeln('  info     - Show device information');
          terminal.writeln('  exit     - Close terminal connection');
          terminal.write('$ ');
          break;
        case 'clear':
          terminal.clear();
          terminal.write('$ ');
          break;
        case 'status':
          terminal.writeln(`\x1b[1;36mDevice Status:\x1b[0m`);
          terminal.writeln(`  Name: ${device.name}`);
          terminal.writeln(`  IP: ${device.ip}`);
          terminal.writeln(`  Status: ${device.status}`);
          terminal.writeln(`  OS: ${device.os}`);
          terminal.writeln(`  Alerts: ${device.alerts || 0}`);
          terminal.write('$ ');
          break;
        case 'info':
          terminal.writeln(`\x1b[1;36mDevice Information:\x1b[0m`);
          terminal.writeln(`  Device Name: ${device.name}`);
          terminal.writeln(`  IP Address: ${device.ip}`);
          terminal.writeln(`  Operating System: ${device.os}`);
          terminal.writeln(`  Status: ${device.status}`);
          terminal.writeln(`  Last Seen: ${new Date(device.lastSeen).toLocaleString()}`);
          terminal.writeln(`  Active Alerts: ${device.alerts || 0}`);
          terminal.write('$ ');
          break;
        default:
          terminal.writeln(`\x1b[1;31mCommand not found: ${command}\x1b[0m`);
          terminal.writeln(`Type "help" for available commands`);
          terminal.write('$ ');
      }
    };

    // Handle command function
    const handleCommand = (command) => {
      if (!command) {
        if (stompClient.connected) {
          terminal.write('$ ');
        }
        return;
      }

      const sessionId = device.id?.toString() || device.name;

      // Handle exit locally
      if (command.toLowerCase() === 'exit') {
        if (stompClient.connected) {
          stompClient.publish({
            destination: '/app/terminal',
            body: JSON.stringify({
              deviceId: sessionId,
              deviceName: device.name,
              deviceIp: device.ip,
              type: 'disconnect',
              command: '',
            }),
          });
        }
        onClose();
        return;
      }

      // Send command to backend if connected
      if (stompClient.connected) {
        stompClient.publish({
          destination: '/app/terminal',
          body: JSON.stringify({
            deviceId: sessionId,
            deviceName: device.name,
            deviceIp: device.ip,
            type: 'command',
            command: command,
          }),
        });
      } else {
        // Fallback to local commands if WebSocket not connected
        handleLocalCommand(command);
      }
    };

    // Handle input
    let currentLine = '';
    terminal.onData((data) => {
      if (data === '\r') {
        // Enter pressed
        terminal.writeln('');
        handleCommand(currentLine.trim());
        currentLine = '';
      } else if (data === '\x7f') {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          terminal.write('\b \b');
        }
      } else {
        currentLine += data;
        terminal.write(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (stompClientRef.current) {
        const sessionId = device.id?.toString() || device.name;
        if (stompClientRef.current.connected) {
          stompClientRef.current.publish({
            destination: '/app/terminal',
            body: JSON.stringify({
              deviceId: sessionId,
              deviceName: device.name,
              deviceIp: device.ip,
              type: 'disconnect',
              command: '',
            }),
          });
          stompClientRef.current.deactivate();
        }
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
      terminal.dispose();
    };
  }, [device, onClose]);

  return (
    <div className="w-full h-full">
      <div ref={terminalRef} className="w-full h-full" style={{ minHeight: '400px' }} />
    </div>
  );
};

export default Terminal;
