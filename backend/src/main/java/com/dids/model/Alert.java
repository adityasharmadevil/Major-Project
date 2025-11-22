package com.dids.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    @Id
    private String id;
    
    private String deviceId;
    private String deviceName;
    private String type;
    private String description;
    private String severity; // critical, high, medium, low
    private String status; // open, resolved
    private LocalDateTime timestamp;
}

