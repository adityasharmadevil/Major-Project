package com.dids.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Device {
    @Id
    private String id;
    
    private String name;
    private String ipAddress;
    private String os;
    private String status; // online, offline
    private LocalDateTime lastSeen;
    private Integer alertCount;
}

