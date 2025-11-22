package com.dids.controller;

import com.dids.dto.TerminalMessage;
import com.dids.service.TerminalService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class TerminalController {

    private final TerminalService terminalService;

    @MessageMapping("/terminal")
    public void handleTerminalMessage(@Payload TerminalMessage message) {
        terminalService.handleTerminalMessage(message);
    }
}

