package com.dids.config;

import org.springframework.context.annotation.Configuration;

/**
 * MongoDB Configuration
 * 
 * If you encounter DNS resolution errors, try the following:
 * 1. Check your internet connection
 * 2. Verify MongoDB Atlas cluster is running
 * 3. Check IP whitelist in MongoDB Atlas (should include 0.0.0.0/0 for development)
 * 4. Try using standard connection string format instead of SRV
 * 5. Test connection using MongoDB Compass or mongo shell
 * 
 * To get standard connection string from MongoDB Atlas:
 * - Go to your cluster → Connect → Connect your application
 * - Copy the connection string and replace mongodb+srv:// with mongodb://
 * - Add specific hostnames and ports
 * 
 * See MONGODB_TROUBLESHOOTING.md for detailed troubleshooting steps.
 */
@Configuration
public class MongoConfig {
    
    // Spring Boot will auto-configure MongoDB using application.properties
    // This class is for documentation and future custom configuration if needed
}

