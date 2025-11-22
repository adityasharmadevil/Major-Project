package com.dids.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Log {
    @Id
    private String id;
    
    private String deviceId;
    private String deviceName;
    private String event;
    private String message;
    private String level; // error, warning, info
    private LocalDateTime timestamp;
}

