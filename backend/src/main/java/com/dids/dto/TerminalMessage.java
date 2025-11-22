package com.dids.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TerminalMessage {
    private String deviceId;
    private String deviceName;
    private String deviceIp;
    private String command;
    private String type; // "connect", "command", "disconnect"
}

