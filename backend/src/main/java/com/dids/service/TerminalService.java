package com.dids.service;

import com.dids.dto.TerminalMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TerminalService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Process> activeProcesses = new ConcurrentHashMap<>();

    public TerminalService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void handleTerminalMessage(TerminalMessage message) {
        String sessionId = message.getDeviceId();
        
        switch (message.getType()) {
            case "connect":
                connectToDevice(message);
                break;
            case "command":
                executeCommand(sessionId, message.getCommand());
                break;
            case "disconnect":
                disconnect(sessionId);
                break;
            default:
                sendMessage(sessionId, "Unknown command type: " + message.getType());
        }
    }

    private void connectToDevice(TerminalMessage message) {
        String sessionId = message.getDeviceId();
        String deviceName = message.getDeviceName();
        String deviceIp = message.getDeviceIp();
        
        try {
            sendMessage(sessionId, "\u001B[1;32mConnected to " + deviceName + " (" + deviceIp + ")\u001B[0m");
            sendMessage(sessionId, "\u001B[1;33mType 'help' for available commands\u001B[0m");
            sendMessage(sessionId, "");
            sendMessage(sessionId, "$ ");
        } catch (Exception e) {
            log.error("Error connecting to device: {}", e.getMessage());
            sendMessage(sessionId, "\u001B[1;31mError connecting to device: " + e.getMessage() + "\u001B[0m");
        }
    }

    private void executeCommand(String sessionId, String command) {
        if (command == null || command.trim().isEmpty()) {
            sendMessage(sessionId, "$ ");
            return;
        }

        String cmd = command.trim().toLowerCase();
        
        // Handle built-in commands
        switch (cmd) {
            case "help":
                sendMessage(sessionId, "Available commands:");
                sendMessage(sessionId, "  help     - Show this help message");
                sendMessage(sessionId, "  clear    - Clear the terminal");
                sendMessage(sessionId, "  status   - Show device status");
                sendMessage(sessionId, "  info     - Show device information");
                sendMessage(sessionId, "  ping     - Ping the device");
                sendMessage(sessionId, "  exit     - Close terminal connection");
                sendMessage(sessionId, "$ ");
                return;
            case "clear":
                sendMessage(sessionId, "\u001B[2J\u001B[H"); // ANSI clear screen
                sendMessage(sessionId, "$ ");
                return;
            case "exit":
                disconnect(sessionId);
                return;
            case "ping":
                sendMessage(sessionId, "PING command - Device is reachable");
                sendMessage(sessionId, "$ ");
                return;
        }

        // Execute system command (for demo purposes - in production, use SSH)
        try {
            ProcessBuilder processBuilder = new ProcessBuilder();
            
            // For Windows
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                processBuilder.command("cmd.exe", "/c", command);
            } else {
                // For Unix/Linux/Mac
                processBuilder.command("sh", "-c", command);
            }
            
            Process process = processBuilder.start();
            activeProcesses.put(sessionId, process);
            
            // Read output
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );
            
            String line;
            while ((line = reader.readLine()) != null) {
                sendMessage(sessionId, line);
            }
            
            // Read errors
            BufferedReader errorReader = new BufferedReader(
                new InputStreamReader(process.getErrorStream())
            );
            
            while ((line = errorReader.readLine()) != null) {
                sendMessage(sessionId, "\u001B[1;31m" + line + "\u001B[0m");
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                sendMessage(sessionId, "\u001B[1;31mCommand exited with code: " + exitCode + "\u001B[0m");
            }
            
            sendMessage(sessionId, "$ ");
            activeProcesses.remove(sessionId);
            
        } catch (Exception e) {
            log.error("Error executing command: {}", e.getMessage());
            sendMessage(sessionId, "\u001B[1;31mError: " + e.getMessage() + "\u001B[0m");
            sendMessage(sessionId, "$ ");
        }
    }

    private void disconnect(String sessionId) {
        Process process = activeProcesses.remove(sessionId);
        if (process != null && process.isAlive()) {
            process.destroy();
        }
        sendMessage(sessionId, "\u001B[1;33mDisconnected from device\u001B[0m");
    }

    private void sendMessage(String sessionId, String message) {
        messagingTemplate.convertAndSend("/topic/terminal/" + sessionId, message);
    }
}

